export default class EventBuilder {
	private json: any;

	public constructor(name: string, once: boolean) {
		this.json = {};
		this.json.name = name;
		this.json.once = once;
		this.json.type = once ? 'once' : 'on';
	}

	public toJSON(): { name: string; once: boolean; type: string } {
		return this.json;
	}
}
