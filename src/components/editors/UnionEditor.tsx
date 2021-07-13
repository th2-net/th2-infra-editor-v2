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
import { observer } from 'mobx-react-lite';
import { useEntityEditor } from '../../hooks/useEntityEditor';
import { OtherSpecs } from '../../models/FileBase';
import { BoxSpecs } from '../../models/Box';
import { DictionarySpecs } from '../../models/Dictionary';

const UnionEditor = () => {

	const { entity, setEntityName, setEntitySpecProperty } = useEntityEditor();
	
	if (!entity) {
		return null;
	}
	
	return (
		<div>
			<div>
				<label htmlFor='name'>
					Name
				</label>
				<input
					id='name'
					type='text'
					autoComplete='off'
					defaultValue={entity.name}
					onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
						setEntityName(event.target.value)
					}}
				/>
			</div>
			{
				entity.spec && Object.entries(entity.spec as (OtherSpecs | BoxSpecs | DictionarySpecs))
					.map(([prop, value]) => (
						<div>
							<label htmlFor={prop}>
								{prop}
							</label>
							<input
								id={prop}
								type='text'
								autoComplete='off'
								defaultValue={value}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									setEntitySpecProperty((prop as keyof (OtherSpecs | BoxSpecs | DictionarySpecs)), event.target.value)
								}}
							/>
						</div>
					))
			}
		</div>
	);
};

export default observer(UnionEditor);
	