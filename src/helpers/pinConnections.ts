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
import { ExtendedConnectionOwner, getPins, Pin, Pins } from '../models/Box';
import { Link } from '../models/LinksDefinition';
import { IBoxConnections } from '../components/links/BoxConnections';

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
	selectedBoxConnections: [IBoxConnections, IBoxConnections] | [null, null],
	selectedBoxPins?: Pins,
): PinsInfo[] | null {
	const [toConnections, fromConnections] = selectedBoxConnections;
	const allConnections = [...(toConnections?.pins || []), ...(fromConnections?.pins || [])];
	if (selectedBoxPins && allConnections) {
		const pinsInfoArray: PinsInfo[] = [];
		getPins(selectedBoxPins).forEach((pin: Pin, index: number) => {
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
