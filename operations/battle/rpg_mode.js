var Character = require('./character')

function rpg_mode(){
	this.characters = [];
	this.createCharacter = function(name,id, charClass){
		var newCharacter = new Character(name,id, charClass, this);
		this.characters.push(newCharacter);
	}
	this.getStat = function(){
		var diceCount = 3;
		var diceFaces = 6;
		var total = 0;
		for(var i=0; i<diceCount; i++){
			var randomVal = Math.floor((Math.random()*diceFaces))+1;
			total += randomVal;
		}
		return total;
	}
	this.getRandomNumber = function(min, max){
		return Math.floor(Math.random()*(max-min))+min;
	}
	this.startBattle = function(combatantArray,cb){
		var currentCombatant = 0;
		var battleID = null;
		var battle_log = {}
		battle_log.result = []
		function progressCombat(){
			var nextCombatant = currentCombatant+1;
			if(nextCombatant===combatantArray.length){
				nextCombatant=0;
			}
			battle_log.result.push(this.characters[currentCombatant].attack(this.characters[nextCombatant]))
			if(this.characters[nextCombatant].isDead()){
				clearInterval(battleID);
				battle_log.winner_id = this.characters[currentCombatant].id
				battle_log.result.push(this.characters[currentCombatant].name)
				cb(battle_log)
			}
			currentCombatant = nextCombatant;

		}
		battleID = setInterval(progressCombat.bind(this),0);
	}
}

module.exports = rpg_mode;





