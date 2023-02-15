/** *****************************************************************************
 * Copyright 2009-2020 Exactpro (Exactpro Systems Limited)
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

import { ConnectionOwner, ExtendedConnectionOwner } from '../models/Box';
import { Link } from '../models/LinksDefinition';

export function convertToExtendedLink(
	link: Link<ConnectionOwner>,
	connectionType: 'mq' | 'grpc',
): Link<ExtendedConnectionOwner> {
	let convertedLink = {
		name: link.name,
		from: {
			box: link.from?.box,
			pin: link.from?.pin,
			connectionType,
		},
		to: {
			box: link.to?.box,
			pin: link.to?.pin,
			connectionType,
		},
	} as Link<ExtendedConnectionOwner>;

	convertedLink = addAdditionalDetailsToLink(convertedLink, {
		fromStrategy: link.from?.strategy,
		toStrategy: link.to?.strategy,
		fromServiceClass: link.from?.['serviceClass'],
		toServiceClass: link.to?.['serviceClass'],
	}) as Link<ExtendedConnectionOwner>;

	return convertedLink;
}

export function convertToOriginLink(link: Link<ExtendedConnectionOwner>): Link<ConnectionOwner> {
	let convertedLink = {
		name: link.name,
		from: {
			box: link.from?.box,
			pin: link.from?.pin,
		},
		to: {
			box: link.to?.box,
			pin: link.to?.pin,
		},
	} as Link<ExtendedConnectionOwner>;

	convertedLink = addAdditionalDetailsToLink(convertedLink, {
		fromStrategy: link.from?.strategy,
		toStrategy: link.to?.strategy,
		fromServiceClass: link.from?.['serviceClass'],
		toServiceClass: link.to?.['serviceClass'],
	}) as Link<ExtendedConnectionOwner>;

	return convertedLink;
}

export function addAdditionalDetailsToLink(
	link: Link<ConnectionOwner | ExtendedConnectionOwner>,
	details: {
		fromStrategy?: string;
		toStrategy?: string;
		fromServiceClass?: string;
		toServiceClass?: string;
	},
) {
	const tempLink = link;

	if (tempLink.from) {
		if (details.fromStrategy) {
			tempLink.from.strategy = details.fromStrategy;
		}
		if (details.fromServiceClass) {
			tempLink.from['serviceClass'] = details.fromServiceClass;
		}
	}

	if (tempLink.to) {
		if (details.toStrategy) {
			tempLink.to.strategy = details.toStrategy;
		}
		if (details.toServiceClass) {
			tempLink.to['serviceClass'] = details.toServiceClass;
		}
	}

	return tempLink;
}

export function createLink(
	name: string,
	from: ExtendedConnectionOwner,
	to: ExtendedConnectionOwner,
): Link<ExtendedConnectionOwner> {
	return {
		name,
		from,
		to,
	};
}
