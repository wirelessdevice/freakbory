const {
  HTMLField, SchemaField, NumberField, StringField, FilePathField, ArrayField
} = foundry.data.fields;

/*Hooks.on("init", () => {
  CONFIG.Actor.dataModels.pc = PCData;
  CONFIG.Actor.dataModels.npc = NPCData;
  CONFIG.Actor.dataModels.vehicle = VehicleData;
  
  CONFIG.Actor.trackableAttributes = {
	  pc: {
		  bar: ["damage", "fatigue"],
		  value: ["luck"]
	  },
	  npc: {
		  bar: ["damage", "fatigue"]
	  },
	  vehicle: {
		  value: ["mp_walk", "mp_run", "mp_jump"]
	  }
  }
});*/

class VehicleData extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		return {
			type: new StringField({ required: true, blank: false, choices: string["Mech","Battle Armour","Ground","Naval","VTOL","Infantry","Aerospace"] }),
			tonnage: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			pilot: new EmbeddedDocumentField({ "Actor", required: false, blank: true }),
			details: new SchemaField({
				model: new StringField({ required: false, blank: true }),
				manufacturer: new StringField({ required: false, blank: true }),
				chassis: new StringField({ required: false, blank: true }),
				engine: new StringField({ required: false, blank: true }),
				communications: new StringField({ required: false, blank: true }),
				sensors: new StringField({ required: false, blank: true })
			}),
			pilot_skills: new SchemaField({
				gunnery: new NumberField({ required: false, integer: true, min: 0, initial: 4 }),
				piloting: new NumberField({ required: false, integer: true, min: 0, initial: 3 }),
				perception: new NumberField({ required: false, integer: true, min: 0, initial: 3 }),
				sensorops: new NumberField({ required: false, integer: true, min: 0, initial: 3 }),
				computers: new NumberField({ required: false, integer: true, min: 0, initial: 3 }),
				comms: new NumberField({ required: false, integer: true, min: 0, initial: 3 })
			}),
			portrait: new FilePathField({ required: false, categories: ["IMAGE"] }),
			mp: new SchemaField({
				walk: new NumberField({ required: true, integer: true, min: 1, initial: 1 }),
				run: new NumberField({ required: true, integer: true, min: 2, initial: 2 }),
				jump: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			})
		};
	}
  
	prepareDerivedData() {
		super.prepareDerivedData();
		
		//Determine run speed
		this.mp.run = this.mp.walk > 0 ? Math.ceil(this.mp.walk*1.5) : 0;
		
		//Vehicles can't drive
		if(this.pilot.type == "vehicle")
			this.pilot = null;
		
		//Determine the skill levels
		if(this.pilot != null && this.type != "Infantry") {
			if(this.pilot.type == "pc")
			{
				this.gunnery = SL(this.pilot.skills.gunnery.value);
				this.piloting = SL(this.pilot.skills.piloting.value);
				this.perception = SL(this.pilot.skills.perception.value);
				this.sensorops = SL(this.pilot.skills.sensorops.value);
				this.computers = SL(this.pilot.skills.computers.value);
				this.comms = SL(this.pilot.skills.comms.value);
			}
			else if(this.pilot.type == "npc")
			{
				const skill_gunnery = this.skills["gunnery"].value;
				const skill_piloting = this.skills["piloting"].value;
				const skill_perception = this.skills["perception"].value;
				const skill_sensorops = this.skills["sensorops"].value;
				const skill_computers = this.skills["computers"].value;
				const skill_comms = this.skills["comms"].value;
				
				this.gunnery = skill_gunnery != null ? skill_gunnery : 4;
				this.piloting = skill_piloting != null ? skill_piloting : 3;
				this.perception = skill_perception != null ? skill_perception : 3;
				this.sensorops = skill_sensorops != null ? skill_sensorops : 3;
				this.computers = skill_computers != null ? skill_computers : 3;
				this.comms = skill_comms != null ? skill_comms : 3;
			}
		}
	}
  
	get SL(xp) {
		//Don't bother with fancy predicates for a safe for-loop ... just never let it get there if we'd have to do error-checking!
		if(xp >= 570)
			return 10;

		//Figure out what the SL is based on the XP spent:
		var sl = -1; //-1 is Untrained.
		var mult = 1;
		for(var i = 20; i <= 570) {
			if(xp < i)
				break; //End condition
			else if (xp >= i) {
				//i goes up by the appropriate amount for the next skill level
				i += (10 * mult++);
				
				//SL goes up by 1
				sl++;
			}
		}

		return sl;
	}
}

class BasicCharacterData extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		return {
			details: new SchemaField({
				gender: new StringField({ required: true, blank: true }),
				age: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
				build: new StringField({ required: true, blank: true }),
				biography: new HTMLField({ required: false, blank: false })
			}),
			portrait: new FilePathField({ required: false, categories: ["IMAGE"] }),
			damage: new SchemaField({
				value: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
				min: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
				max: new NumberField({ required: true, integer: true, min: 0, initial: 20 })
			}),
			fatigue: new SchemaField({
				value: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
				min: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
				max: new NumberField({ required: true, integer: true, min: 0, initial: 20 })
			}),
			fatigueFragments: new SchemaField({
				value: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
				min: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
				max: new NumberField({ required: true, integer: true, min: 0, initial: 12 })
			}),
			mp: new SchemaField({
				walk: new NumberField({ required: true, integer: true, min: 1, initial: 1 }),
				run: new NumberField({ required: true, integer: true, min: 1, initial: 1 }),
				sprint: new NumberField({ required: true, integer: true, min: 1, initial: 1 }),
				jump: new NumberField({ required: true, integer: true, min: 1, initial: 1 }),
				swim: new NumberField({ required: true, integer: true, min: 1, initial: 1 }),
				crawl: new NumberField({ required: true, integer: true, min: 1, initial: 1 })
			})
		};
	}
	
	//This will need to move to token.
	const oldLocation = this.actor.token.center;
	const hook_pickedUp = Hooks.on('_onDragLeftStart', this.move_dragStart.bind(this));
	const hook_putDown = Hooks.on('_onDragEnd', this.move_dragEnd.bind(this));
	
	const moved = false;
	const movedThisTurn = 0;
	
	move_dragStart(event) {
		oldLocation = this.actor.token.center;
	}
	
	move_dragEnd() {
		const newLocation = this.actor.token.center;
		
		//if(!moved && oldLocation != newLocation)
		//	moved = true;
	
		//Maybe the distance in metres is calculated by the hypotenuse of the difference in X/gridsize and Y/gridsize of the two positions?
		//If A is horizontal and B is vertical, then C is the diagonal.
		//If A is 100 because you moved two 50-size grid squares, and B is 50 because it was a diagonal move up one square,
		//Then you would expect C^2 to be 2^2 + 1^2 (or 5), so C (straight-line distance) is 2.23 (sqrt 5).
		//So we add 2.23 to the move distance this turn. You've effectively moved 2.23 metres.
		//What effect will this have? I wish there was a way to just count squares moved.
		
		//do some math magic: moveDistance
		//movedThisTurn += moveDistance;
	}
	
	/*const hook_move = Hooks.on('dropCanvasData', this.turn_end.bind(this));
	
	move_calcFatigue(canvas, data) {
		if(actor.id == this.id) {
			//Do something
		}
	}*/
	
	const hook_turnEnd('combatTurnChange', this.turnEnd.bind(this));
	
	turnEnd(combat, prior, current) {
		if(prior.combatant.id == this.id) {
			if(moved) {
				//Walked or sprinted?
				this.fatigueFragments.value += (movedThisTurn <= this.mp.walk ? 1 : 3); //1 if walked, 3 if sprinted.
				
				//Account for encumbered movement.
				//if(encumbered)
				//	this.fatigueFragments.value += 1;
				
				//Reset the count.
				moved = false;
			}
		}
	}
}

class NPCData extends BasicCharacterData {
	static defineSchema() {
		return {
			...super.defineSchema(),
			general_skill: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			skills: new ArrayField({ new SchemaField({
				name: new StringField({ required: true, blank: false }),
				value: new NumberField({ required: true, integer: true, min: -10, initial: -1 })
			}), required: false })
			healthmax: new NumberField({ required: true, integer: true, min: 0, initial: 20 }),
			fatiguemax: new NumberField({ required: true, integer: true, min: 0, initial: 20 })
			//skills: new ArrayField({ new StringField({ required: false, blank: true }), required: false })
		};
	}
  
	prepareDerivedData() {
		super.prepareDerivedData();

		//Bound health and fatigue
		this.health.max = this.healthmax;
		this.health.value = Math.min(this.health.value, this.health.max);
		this.health.value = Math.max(this.health.value, 0);

		this.fatigue.max = this.fatiguemax;
		this.fatigue.value = Math.min(this.fatigue.value, this.fatigue.max);
		this.fatigue.value = Math.max(this.fatigue.value, 0);
		
		this.fatigueFragments.max = 12 * (this.healthmax/2); //Health would be BOD * 2, so fatigueFragment max would be 12 * BOD or 12 * maxhealth/2.
	}
}

class PCData extends BasicCharacterData {
  static defineSchema() {
    return {
		...super.defineSchema(),
		advancement: new SchemaField({
			xp_total: new NumberField({ required: true, integer: true, min: 0, initial: 5000 }),
			xp_spent: new NumberField({ required: true, integer: true, min: 0, initial: 5000 }),
			xp_unspent: new NumberField({ required: true, integer: true, min: 0, initial: 5000 })
		}),
		luck: new SchemaField({
			value: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			min: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			max: new NumberField({ required: true, integer: true, min: 0, initial: 10 })
		}),
		attributes: new SchemaField({
			STR: new SchemaField({
				level: new NumberField({ required: false, integer: true, min: 0, initial: 0 }),
				xp: new NumberField({ required: false, integer: true, min: 0, initial: 0 })
			}),
			BOD: new SchemaField({
				level: new NumberField({ required: false, integer: true, min: 0, initial: 0 }),
				xp: new NumberField({ required: false, integer: true, min: 0, initial: 0 })
			}),
			RFL: new SchemaField({
				level: new NumberField({ required: false, integer: true, min: 0, initial: 0 }),
				xp: new NumberField({ required: false, integer: true, min: 0, initial: 0 })
			}),
			DEX: new SchemaField({
				level: new NumberField({ required: false, integer: true, min: 0, initial: 0 }),
				xp: new NumberField({ required: false, integer: true, min: 0, initial: 0 })
			}),
			WIL: new SchemaField({
				level: new NumberField({ required: false, integer: true, min: 0, initial: 0 }),
				xp: new NumberField({ required: false, integer: true, min: 0, initial: 0 })
			}),
			INT: new SchemaField({
				level: new NumberField({ required: false, integer: true, min: 0, initial: 0 }),
				xp: new NumberField({ required: false, integer: true, min: 0, initial: 0 })
			}),
			CHA: new SchemaField({
				level: new NumberField({ required: false, integer: true, min: 0, initial: 0 }),
				xp: new NumberField({ required: false, integer: true, min: 0, initial: 0 })
			}),
			EDG: new SchemaField({
				level: new NumberField({ required: false, integer: true, min: 0, initial: 0 }),
				xp: new NumberField({ required: false, integer: true, min: 0, initial: 0 })
			})
		}),
		skills: new SchemaField({
			//skills: new ArrayField(new StringField())
			acrobatics: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			climbing: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			navigation_air: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			navigation_ground: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			navigation_kfjump: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			navigation_sea: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			navigation_space: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			perception: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			running: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			stealth: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			swimming: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			tracking: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			zero_g_operations: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			artillery: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			communications_conventional: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			communications_hpg: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			communications_blackbox: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			driving_ground: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			driving_rail: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			driving_sea: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			piloting_aerospace: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			piloting_air: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			piloting_battlesuit: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			piloting_mech: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			piloting_protomech: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			piloting_spacecraft: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			sensor_operations: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			technician_aeronautics: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			technician_cybernetics: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			technician_electronic: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			technician_jets: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			technician_mechanical: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			technician_myomer: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			technician_nuclear: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			technician_weapons: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			archery: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			demolitions: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			escape_artist: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			martial_arts: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			medtech_general: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			medtech_veterinary: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			melee_weapons: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			small_arms: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			strategy: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			support_weapons: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			surgery: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			tactics: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			thrown_weapons: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			acting_carouse: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			acting_deception: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			acting_impersonation: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			acting_intimidation: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			acting_seduction: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			animal_handling: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			disguise: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			interrogation: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			leadership: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			negotiation: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			prestidigitation_pickpocket: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			prestidigitation_sleight_of_hand: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			prestidigitation_quickdraw: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			training: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			administration: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			appraisal: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			computers: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			cryptography: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			forgery: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			investigation: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			science: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			security_systems: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			art_1: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			art_2: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			art_3: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			art_4: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			art_5: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			career_1: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			career_2: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			career_3: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			career_4: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			career_5: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			interest_1: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			interest_2: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			interest_3: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			interest_4: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			interest_5: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			language_1: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			language_2: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			language_3: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			language_4: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			language_5: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			protocol_1: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			protocol_2: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			protocol_3: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			protocol_4: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			protocol_5: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			survival_1: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			survival_2: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			survival_3: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			survival_4: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			survival_5: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			streetwise_1: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			streetwise_2: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			streetwise_3: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			streetwise_4: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
			streetwise_5: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
		})
	};
  }
  
  prepareDerivedData() {
		super.prepareDerivedData();

		//get the TP for attributes
		this.attributes.STR.level = TP(this.attributes.STR.xp);
		this.attributes.BOD.level = TP(this.attributes.BOD.xp);
		this.attributes.RFL.level = TP(this.attributes.RFL.xp);
		this.attributes.DEX.level = TP(this.attributes.DEX.xp);
		this.attributes.WIL.level = TP(this.attributes.WIL.xp);
		this.attributes.INT.level = TP(this.attributes.INT.xp);
		this.attributes.CHA.level = TP(this.attributes.CHA.xp);
		this.attributes.EDG.level = TP(this.attributes.EDG.xp);

		//Bound health and fatigue
		this.health.max = this.attributes.BOD.level*2;
		this.health.value = Math.min(this.health.value, this.health.max);
		this.health.value = Math.max(this.health.value, 0); //Make sure the max is equal to or greater than zero.

		this.fatigue.max = this.attributes.WIL.level*2;
		this.fatigue.value = Math.min(this.fatigue.value, this.fatigue.max);
		this.fatigue.value = Math.max(this.fatigue.value, 0); //Make sure the max is equal to or greater than zero.
		
		this.fatigueFragments.max = 12 * TP(this.attributes.bod_xp.value);
		this.fatigueFragments.value = Math.min(this.fatigueFragments.value, this.fatigueFragments.max);
		this.fatigue.value = Math.max(this.fatigueFragments.value, 0); //Make sure the max is equal to or greater than zero.
  }
  
  get TP(xp) {
	  return Math.floor(xp/100);
  }
  
  get SL(xp) {
	  //Don't bother with fancy predicates for a safe for-loop ... just never let it get there if we'd have to do error-checking!
	  if(xp >= 570)
		  return 10;
	  
	  //Figure out what the SL is based on the XP spent:
	  var sl = -1; //-1 is Untrained.
	  var mult = 1;
	  for(var i = 20; i <= 570) {
		  if(xp < i)
			  break; //End condition
		  else if (xp >= i) {
			  //i goes up by the appropriate amount for the next skill level
			  i += (10 * mult++);
			  
			  //SL goes up by 1
			  sl++;
		  }
	  }
	  
	  return sl;
  }
  
  get skillNextXP(xp) {
	  //Don't bother with fancy predicates for a safe for-loop ... just never let it get there if we'd have to do error-checking!
	  if(XP >= 570)
		  return 0;
	  
	  var mult = 1;
	  for(var i = 20; i <= 570) {
		  if(xp < i)
			  break; //End condition
		  else if (xp >= i) {
			  //i goes up by the appropriate amount for the next skill level
			  i += (10 * mult++);
		  }
	  }
	  
	  return i-xp;
  }
}

class ItemData extends foundry.abstract.TypeDataModel {
	
}

class WeaponData extends ItemData {
	
}

class ArmourData extends ItemData {
	
}

class EquipmentData extends ItemData {
	
}

class VehicleWeaponData extends ItemData {
	
}

class VehicleEquipmentData extends ItemData {
	
}

class PropertyData extends ItemData {
	
}

