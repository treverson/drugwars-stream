

function Weapon(name, bonus, damageIdentifier){
	this.name = name;
	this.bonus = bonus;
	this.damage = {
		diceCount : null,
		diceValue : null
	}

	this.init = function(damageIdentifier){
		this.generateDamageValues(damageIdentifier);
	}
	this.generateDamageValues = function(damageIdentifier){
		//1d4  3d6 2d12
		damageArray = damageIdentifier.split('d');
		this.damage.diceCount = damageArray[0];
		this.damage.diceValue = damageArray[1];
	}
	this.generateDamage = function(){
		var total = 0;
		for(var i=0; i<this.damage.diceCount; i++){
			var randomVal = Math.floor((Math.random()*this.damage.diceValue))+1;
			total += randomVal;
		}
		return total;		
	}
	this.init(damageIdentifier);
}
module.exports = Weapon;



