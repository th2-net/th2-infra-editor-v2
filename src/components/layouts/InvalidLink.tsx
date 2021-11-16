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

import { InvalidLink, InvalidLink1 } from '../../helpers/pinConnections';

export function InvalidLinkItems(props: { invalidLinks: InvalidLink1[] }) {
	const f = 0;
	return (
		<ul style={{ listStyleType: 'decimal' }}>
			{props.invalidLinks.map(link =>
				link.lostPins.map(pin => (
					<li style={{ marginBottom: '10px' }}>
						pin <b>{pin.pin}</b> not found in box <b>{pin.box}</b> in link <b>{link.link.name}</b>
					</li>
				)),
			)}
			{props.invalidLinks.map(link =>
				link.lostBoxes.map(box => (
					<li style={{ marginBottom: '10px' }}>
						box <b>{box.box}</b> not found in link <b>{link.link.name}</b>
					</li>
				)),
			)}
		</ul>
	);
}
