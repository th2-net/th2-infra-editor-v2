/**
 * Returns typed object keys
 * @param obj
 */
 export function getObjectKeys<O extends object>(obj: O) {
	return Object.keys(obj) as Array<keyof O>;
}