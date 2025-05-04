export interface Route {
	path: string;
	method: string;
	status: 'enabled' | 'disabled';
	responses: {
		statusCode: number;
		body: string;
		headers: { key: string; value: string }[];
	}[];
}

export interface Config {
	uuid: string;
	name: string;
	configFile: string;
	port: number;
	url: string;
	size: string;
	modified: string;
	inUse: boolean;
}
