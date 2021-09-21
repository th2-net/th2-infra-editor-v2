import { SchemaStore } from './SchemaStore';
import ApiSchema from '../api/ApiSchema';
import { action, makeObservable, observable, reaction } from 'mobx';
import { BoxStatus } from '../models/Box';

enum Events {
	StatusUpdate = 'statusUpdate',
	RepositoryUpdate = 'repositoryUpdate',
}

export default class SubscriptionStore {
	constructor(
		private api: ApiSchema,
		private schemasStore: SchemaStore,
	) {
		makeObservable(this, {
			subscription: observable,
			isSubscriptionSuccessful: observable,
			isConnectionOpen: observable,
			boxStates: observable,
			isReconnecting: observable,
			closeConnection: action,
			init: action
		});

		reaction(
			() => schemasStore.schemaSettings,
			schemaSettings => {
				const propagation = schemaSettings?.spec['k8s-propagation'];
				if (propagation) {
					this.subscription?.close();
					if (['sync', 'rule'].includes(propagation)) {
						this.init();
					}
				}
			},
		);
	}

	subscription: EventSource | null = null;

	public isSubscriptionSuccessful = false;

	public isConnectionOpen = false;

	public boxStates = new Map<string, BoxStatus>();

	 isReconnecting = false;

	public closeConnection = () => {
		this.subscription?.close();
	};

	private fetchChanges = async () => {
		if (this.schemasStore.selectedSchema) {
			this.schemasStore.fetchSchemaState(this.schemasStore.selectedSchema);
		}
	};

	async init() {
		if (!this.schemasStore.selectedSchema) return;
		this.subscription = this.api.subscribeOnChanges(this.schemasStore.selectedSchema);

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
			this.fetchChanges()
		});
	}
}
