export class ATOWPersonActor extends Actor {
	async applyDamage(damage, fatigue == false, attack == false) {
		// Always take a minimum of 1 damage, and round to the nearest integer.
		damage = Math.round(Math.max(1, damage));
		
		//Need to account for armour in here.

		// Update the health.
		const { value } = fatigue ? this.system.fatigue : this.system.damage;
		if(fatigue)
			await this.update({ "system.damage.value": value + damage });
		else
			await this.update({ "system.fatigue.value": value + damage });
		
		if(attack)
		{
			//Stunned
			
			//+1 Fatigue
		}

		// Log a message.
		await ChatMessage.implementation.create({
			content: `${this.name} took ${damage} ${fatigue ? "fatigue damage" : "damage"}!`
		});
	}
}

export class ATOWItem extends Item {
	
}

export class ATOWVehicleActor extends Actor {
	
}