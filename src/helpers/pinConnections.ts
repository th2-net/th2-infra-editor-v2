/** *****************************************************************************
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

import { IPosition } from 'monaco-editor';
import { IPinConnections } from '../components/links/BoxConnections';
import { ExtendedConnectionOwner, Pin } from '../models/Box';
import { Link } from '../models/LinksDefinition';
import { BoxesStore } from '../stores/BoxesStore';
import { BoxUpdater } from '../stores/BoxUpdater';

export type PinsPositions = {
	connections: number;
	position: IPosition;
};

export type PinsInfo = {
	name: string;
	numOfConnections: number;
};

export type InvalidLink = {
	link: Link<ExtendedConnectionOwner>;
	lostBoxes: {
		box: string;
	}[];
	lostPins: {
		pin: string;
		box: string;
	}[];
};

export function getCountPinsConnections(
	boxesStore: BoxesStore,
	boxUpdater: BoxUpdater,
): PinsInfo[] | null {
	const selectedBoxPins = boxesStore.selectedBox?.spec.pins;
	const [toConnections, fromConnections] = boxUpdater.selectedBoxConnections;
	const allConnections = [...(toConnections?.pins || []), ...(fromConnections?.pins || [])];
	if (selectedBoxPins && allConnections) {
		const pinsInfoArray: PinsInfo[] = [];
		selectedBoxPins.forEach((pin: Pin, index: number) => {
			pinsInfoArray[index] = { name: pin.name, numOfConnections: 0 };
			allConnections.forEach((iPinConnection: IPinConnections) => {
				if (JSON.stringify(iPinConnection.pin) === JSON.stringify(pin)) {
					pinsInfoArray[index] = {
						name: pin.name,
						numOfConnections: pinsInfoArray[index].numOfConnections + iPinConnection.boxes.length,
					};
				}
			});
		});
		return pinsInfoArray;
	}
	return null;
}

export function detectInvalidLinks(boxesStore: BoxesStore, boxUpdater: BoxUpdater): InvalidLink[] {
	console.log(boxUpdater.links.length);
	const invalidLinks: InvalidLink[] = [];
	boxUpdater.links.forEach(link => {
		var invalidLink: InvalidLink = {
			link: link,
			lostBoxes: [],
			lostPins: [],
		};
		for (let i = 0; i < 2; i++) {
			const box = boxesStore.boxes.find(
				box => box.name === (i === 0 ? link.from?.box : link.to?.box),
			);
			if (box === undefined) {
				invalidLink.lostBoxes.push({
					box: i === 0 ? link.from?.box || '' : link.to?.box || '',
				});
			} else {
				const pins = box.spec.pins?.find(
					pin => pin.name === (i === 0 ? link.from?.pin : link.to?.pin),
				);
				if (pins === undefined) {
					invalidLink.lostPins.push({
						pin: i === 0 ? link.from?.pin || '' : link.to?.pin || '',
						box: box.name,
					});
				}
			}
		}
		if (invalidLink.lostBoxes.length > 0 || invalidLink.lostPins.length > 0) {
			invalidLinks.push(invalidLink);
		}
	});
	return invalidLinks;
}

export function deleteInvalidLinks(invalidLinks: InvalidLink[], boxUpdater: BoxUpdater) {
	console.log(invalidLinks.length);
	invalidLinks.forEach(link => {
		boxUpdater.deleteLink(link.link);
	});
}

export function selectBox(boxName: string, boxesStore: BoxesStore){
	const boxEntity = boxesStore.boxes.find(box => box.name === boxName);
	if(boxEntity){
		boxesStore.selectBox(boxEntity);
	} else {
		console.log('error select box');
	}
}
