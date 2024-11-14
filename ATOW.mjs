import { ATOWPersonActor, ATOWItem, ATOWVehicleActor } from "./module/documents.mjs";
import { VehicleData, NPCData, PCData, WeaponData, ArmourData, EquipmentData, VehicleWeaponData, VehicleEquipmentData, PropertyData } from "./module/data-models.mjs";
import { PersonActorSheet } from "./module/sheets/PersonActorSheet.mjs";
import { ATOWItemSheet } from "./module/sheets/ATOWItemSheet.mjs";
import { VehicleActorSheet } from "./module/sheets/VehicleActorSheet.mjs";
import { PropertySheet } from "./module/sheets/PropertySheet.mjs";

import { preloadHandlebarsTemplates } from './helpers/templates.mjs';
import { ATOW } from './helpers/config.mjs';

Hooks.once("init", () => {
	game.ATOW = {
		ATOWPersonActor,
		ATOWItem,
		ATOWVehicleActor,
		rollItemMacro,
	};
	
	CONFIG.ATOW = ATOW;
	
	CONFIG.Combat.initiative = {
		formula: 2d6,
		decimals: 0,
	};
	
	// Configure custom Document implementations.
	CONFIG.Actor.documentClass = ATOWPersonActor;
	CONFIG.Item.documentClass = ATOWItem;

	// Configure System Data Models.
	CONFIG.Actor.dataModels = {
		pc: PCData,
		npc: NPCData,
		vehicle: VehicleData
	};
	CONFIG.Item.dataModels = {
		weapon: WeaponDataModel,
		armour: ArmourDataModel,
		equipment: EquipmentDataModel,
		vehicle_weapon: VehicleWeaponDataModel,
		vehicle_equipment: VehicleEquipmentDataModel,
		property: PropertyDataModel
	};

	// Configure trackable attributes.
	CONFIG.Actor.trackableAttributes = {
		pc: {
			bar: ["damage", "fatigue"],
			value: ["luck"]
		},
		npc: {
			bar: ["damage", "fatigue"],
			value: []
		},
		vehicle: {
			bar: [],
			value: ["mp_walk", "mp_run", "mp_jump"]
		}
	};

	// Register sheet application classes
	Actors.unregisterSheet("core", ActorSheet);
	Items.unregisterSheet("core", ItemSheet);

	Actors.registerSheet("ATOW", PersonActorSheet,
	{
		types: ["pc", "npc"],
		makeDefault: true,
		label: 'ATOW.SheetLabels.PersonActor',
	});
	Actors.registerSheet("ATOW", VehicleActorSheet,
	{
		types: ["vehicle"],
		makeDefault: true,
		label: 'ATOW.SheetLabels.VehicleActor',
	});
	Actors.registerSheet("ATOW", ItemSheet,
	{
		types: ["weapon", "armour", "equipment", "vehicle_weapon", "vehicle_equipment", "property"],
		makeDefault: true,
		label: 'ATOW.SheetLabels.Item',
	});

	// Preload Handlebars templates.
	return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here is a useful example:
Handlebars.registerHelper('toLowerCase', function (str) {
  return str.toLowerCase();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createItemMacro(data, slot));
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== 'Item') return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn(
      'You can only create macro buttons for owned Items'
    );
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.boilerplate.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: 'script',
      img: item.img,
      command: command,
      flags: { 'boilerplate.itemMacro': true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid,
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then((item) => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(
        `Could not find item ${itemName}. You may need to delete and recreate this macro.`
      );
    }

    // Trigger the item roll
    item.roll();
  });
}
