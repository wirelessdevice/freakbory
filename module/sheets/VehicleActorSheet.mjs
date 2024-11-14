export class VehicleActorSheet extends ActorSheet {
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["ATOW","sheet","actor","vehicleactor"],
			template: "systems/ATOW/templates/VehicleActorSheet.html",
			width: 850,
			height: 720,
			tabs: [],
			dragDrop: [{dragSelector: [".draggable", ".item", ".reorder"], dropSelector: null}]
		});
	}
	
	getData() {
		const context = super.getData();
		
		context.systemData = context.data.system;
		
		return context;
	}
	
	activateListeners(html) {
		super.activateListeners(html);

		accessibility(this.item, html);

		// Everything below here is only needed if the sheet is editable
		if ( !this.isEditable ) return;
	}
}