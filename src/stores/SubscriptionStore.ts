import { SchemaStore } from './SchemaStore';
import ApiSchema from '../api/ApiSchema';
import { action, makeObservable, observable, reaction } from 'mobx';
import { BoxStatus } from '../models/Box';

enum Events {
	StatusUpdate = 'statusUpdate',
	RepositoryUpdate = 'repositoryUpdate',
}

export default class SubscriptionStore {
	constructor(private api: ApiSchema, private schemasStore: SchemaStore) {
		makeObservable(this, {
			boxStates: observable,
			init: action,
		});

		reaction(
			() => schemasStore.schemaSettings,
			schemaSettings => {
				const propagation = schemaSettings?.spec['k8s-propagation'];
				if (propagation) {
					this.closeConnection();
					if (['sync', 'rule'].includes(propagation)) {
						this.init();
					}
				}
			},
		);
	}

	private subscription: EventSource | null = null;

	private isSubscriptionSuccessful = false;

	private isConnectionOpen = false;

	public boxStates = new Map<string, BoxStatus>();

	private isReconnecting = false;

	private closeConnection = () => {
		this.subscription?.close();
		this.boxStates.clear();
	};

	private fetchChanges = async () => {
		if (!this.schemasStore.selectedSchemaName) throw new Error('selectedSchemaName isn\'t exists');

		this.schemasStore.fetchSchemaState(this.schemasStore.selectedSchemaName);
	};

	async init() {
		if (!this.schemasStore.selectedSchema) {
			throw new Error("'selectedSchema' field shouldn't be undefined");
		}
		this.subscription = this.api.subscribeOnChanges(this.schemasStore.selectedSchemaName ?? '');

		this.subscription.onopen = () => {
			this.isSubscriptionSuccessful = true;
			this.isConnectionOpen = true;
			if (this.isReconnecting) {
				this.fetchChanges();
				this.isReconnecting = false;
			}
		};

		this.subscription.onerror = e => {
			if (this.subscription?.readyState !== EventSource.CONNECTING) {
				console.error(e);
			}
			this.isConnectionOpen = false;
			this.isReconnecting = true;
		};

		this.subscription.addEventListener(Events.StatusUpdate, e => {
			const messageData = JSON.parse((e as MessageEvent).data);
			this.boxStates.set(messageData.name, messageData.status);
		});

		this.subscription.addEventListener(Events.RepositoryUpdate, () => {
			this.fetchChanges();
		});
	}
}
