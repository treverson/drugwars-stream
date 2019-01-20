var Weapon = require('./weapon')
var Attributes = require('./attributes')

function Character(name,id, charClass, parent){
	this.id = id;
	this.name = name;
	this.class = charClass;
	this.parent = parent;
	this.baseArmor = 10;
	this.hitpoints = 8;
	this.armor = 10;
	this.weapon = null;
	this.stats = {
		str: null,
		dex: null,
		con: null,
		int: null,
		wis: null,
		cha: null
	}
	this.addWeapon = function(name, bonus, damageID){
		this.weapon = new Weapon(name, bonus, damageID);
	}
	this.init = function(){
		this.createStats();
		this.addWeapon('fist',0,'1d3');
		this.determineArmorClass();
		this.deteremineConBonus();
	}
	this.isDead = function(){
		if(this.hitpoints<0){
			return true;
		}
		return false;
	}
	this.determineStatBonus = function(stat){
		var bonus = Math.floor(stat /4)-2;
		return bonus;
	}
	this.determineArmorClass = function(){
		this.armor = this.baseArmor + this.determineStatBonus(this.stats.dex);
	}
	this.deteremineConBonus = function(){
		this.hitpoints += this.determineStatBonus(this.stats.con);
	}
	this.determineAttackBonus = function(){
		return this.determineStatBonus(this.stats.str);
	}
	this.createStats = function(){
		for(var i in this.stats){
			this.stats[i] = this.parent.getStat();
		}
	}
	this.takeDamage = function(damageAmount){
		var result = "";
		this.hitpoints -= damageAmount;
		result = this.name + ' takes '+damageAmount + ' damage!'
		if(this.hitpoints<0){
			result = result + ";" +  'I, '+this.name+' am now dead'
		}
		return result
	}
	this.attack = function(target){
		var attackRoll = this.parent.getRandomNumber(1,20) + this.determineAttackBonus();
		if(attackRoll>=target.armor){
			var damage = this.weapon.generateDamage();
			return this.name + ' attacks ' + target.name + ' and deal '+ attackRoll + "damages;" + this.name + ' hits ' + target.name +";" +  target.takeDamage(damage)
		} else {
			return this.name + ' misses ' + target.name
		}
	}
	this.init();
}
module.exports = Character;



