// naive implementation
export const pluralise = (text: string, count: number) => (count === 1 ? text : `${text}s`)