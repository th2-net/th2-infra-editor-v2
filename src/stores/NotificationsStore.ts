/** ****************************************************************************
 * Copyright 2020-2020 Exactpro (Exactpro Systems Limited)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************** */

import { action, makeObservable, observable } from 'mobx';
import { AppearanceTypes } from 'react-toast-notifications';

interface BaseNotification {
    type: AppearanceTypes;
    notificationType: 'linkErrorMessage' | 'boxResourceErrorMessage' | 'exceptionMessage';
    id: string;
}

export interface LinkErrorMessage extends BaseNotification {
    notificationType: 'linkErrorMessage';
    linkName: string;
    message: string;
    from: string;
    to: string;
}

export interface BoxResourceErrorMessage extends BaseNotification {
    notificationType: 'boxResourceErrorMessage';
    box: string;
    message: string;
}

export interface ExceptionMessage extends BaseNotification {
    notificationType: 'exceptionMessage';
    message: string;
}

export type Notification = LinkErrorMessage | BoxResourceErrorMessage | ExceptionMessage;

export class NotificationsStore {


    constructor() {
        makeObservable(this, {
            errors: observable,
            addMessage: action,
            deleteMessage: action,
            clearAll: action
        });
    }

    public errors: Notification[] = [];

    public addMessage = (error: Notification) => {
        this.errors = [...this.errors, error];
    };

    public deleteMessage = (error: Notification | string) => {
        if (typeof error === 'string') {
            this.errors = this.errors.filter(e => e.id !== error);
        } else {
            this.errors = this.errors.filter(e => e !== error);
        }
    };

    public clearAll = () => {
        this.errors = [];
    };
}

const notificationsStore = new NotificationsStore();

export default notificationsStore;
