/**
 *
 */

// storing pokemon data
angular.module("PokemonModule").service("PokeStore", function($http, $state) {
       	var poSto = this;
       	poSto.refresh = true;
       	poSto.baseLevel = 60;
       	poSto.pokeArray=[]; // where the base pokemon RESPONSES are stored
       	poSto.playerPokemonArray = [[],[]]; // players' pokemon team
       	poSto.activeBattlers = [0,0];

       	
       	// pull pokemon from response data and sores them in player 0 and 1 array
       	poSto.unboxPokemon = function(){
       		for(ii=0;ii<poSto.pokeArray.length;ii++){
       			poSto.playerPokemonArray[ii%2].push(poSto.pokeArray[ii].data);
       		}
       	}
       	
     // returns promise to get pokemon - used with generate controller
    	poSto.requestPokemon = function(input) {
    		return $http({
    			method:"GET",
    			url:"https://pokeapi.co/api/v2/pokemon/" + input + "/"
			});
    	}
    	
    	poSto.levelMod= function(){
    		poSto.adder = (Math.floor(Math.random() * 15))+1;
    		poSto.adderModifier = 1;
    		if (((Math.floor(Math.random() * 15))+1) %2 ==0){
    			poSto.adderModifier = -1;
    		}
    		return poSto.adder*poSto.adderModifier;
    	}
    	
    	poSto.setStats = function(teamIndex){
    		for(ii=0;ii<3;ii++){
    			poSto.setSprites(poSto.playerPokemonArray[teamIndex][ii]);
    			poSto.setBattleStats(poSto.playerPokemonArray[teamIndex][ii],ii);
    		}
    	}
    	
    	poSto.setSprites=function(pokemon){
    			pokemon.imageFront="resources/sprites/front/"+pokemon.id+".png";
    			pokemon.imageBack="resources/sprites/back/"+pokemon.id+".png";
    	}
    	
    	poSto.setBattleStats = function(pokemon, num){
    		pokemon.battleStats = {};
    		pokemon.battleStats.isAlive = true;
    		pokemon.battleStats.isActive = false;
    		pokemon.battleStats.index = num;
    		pokemon.battleStats.level = poSto.baseLevel + poSto.levelMod();
    		pokemon.battleStats.hpBarType="success"
       		pokemon.battleStats.speed = (pokemon.stats[0].base_stat)+(4*pokemon.battleStats.level);
    		pokemon.battleStats.spDefense = (pokemon.stats[1].base_stat)+(4*pokemon.battleStats.level);
    		pokemon.battleStats.spAttack = (pokemon.stats[2].base_stat)+(4*pokemon.battleStats.level);
    		pokemon.battleStats.phDefense = (pokemon.stats[3].base_stat)+(4*pokemon.battleStats.level);
    		pokemon.battleStats.phAttack = (pokemon.stats[4].base_stat)+(4*pokemon.battleStats.level);
    		pokemon.battleStats.hpMax = (pokemon.stats[5].base_stat)+(4*pokemon.battleStats.level);
    		pokemon.battleStats.hpCurr = (pokemon.stats[5].base_stat)+(4*pokemon.battleStats.level);  		
    	}
    	
    	
    	/*
    	// NOT FUNCTIONAL FOR NOW
    	poSto.getMoves = function(pokemon){
    		poSto.maxMoveNum = pokemon.moves.length;
    		console.log("Max Moves: ");
    		console.log(poSto.maxMoveNum);
    		
    		(Math.floor(Math.random() * poSto.maxMoveNum))+1;
    		
    	}
    	*/
    	
    	
    	poSto.switchBattler = function(player, inPoke){
    		poSto.outPokemon = poSto.activeBattlers[player];
    		poSto.outPokemon.battleStats.isActive = false;
    		poSto.playerPokemonArray[player][poSto.outPokemon.battleStats.index] = poSto.outPokemon;
    		poSto.inPokemon = poSto.playerPokemonArray[player][inPoke];
    		poSto.inPokemon.battleStats.isActive = true;
    		poSto.activeBattlers[player] = poSto.inPokemon;
    	}
    	
    	// clears the base pokemon arrays
    	poSto.clearPokeArray= function(){
    		poSto.pokeArray.splice(0);
    		poSto.playerPokemonArray = [[],[]];
    	};
    	
    	
 });


// battle logic service
angular.module("PokemonModule").service("BattleLogic", function(PokeStore){
	var battle=this;
	
	battle.curr=0;
	battle.max=0;
	battle.refHp=0;
	
	// object to be returned containing each move's data
	battle.retObj={};
	
	// ratio of poke speeds against random value determines critical hit
	// returns a multipler of damage
	battle.critical=function(attacker, defender){
		battle.critCompare=(Math.random() * 3)+0.25;
		if((PokeStore.activeBattlers[attacker].battleStats.speed/PokeStore.activeBattlers[defender].battleStats.speed)>battle.critCompare){
			console.log("ciritcal hit!")
			battle.retObj.display="Critical Hit!";
			return 2; 
		} else{
			battle.retObj.display="Hit!";
			return 1; 
		}
	}
	
	battle.miss=function(){
		battle.missCompare=(Math.floor(Math.random() * 99))+1;
		return (battle.missCompare%6);
	}
	
	battle.checkTeamStatus=function(input){
		battle.teamArray = PokeStore.playerPokemonArray[input];
		battle.teamAlive=0;
		for(ii=0;ii<3;ii++){
			if((battle.teamArray[ii].battleStats.isAlive)){
				battle.teamAlive++;
			}
		} // return either the team index that indicates which player switch screen needs to be shown
		  // or return a negative value of the player (-1 or -2) that indicates the loser
		if(battle.teamAlive>0){
			return input;
		} else{
			return (input+1)*-1;
		}
	}
	
	// it seems this may only work for a 1v1 battle
	battle.faintCheck=function(defender){
		if(PokeStore.activeBattlers[defender].battleStats.hpCurr <= 0){
			console.log(PokeStore.activeBattlers[defender].name + " fainted!")
			PokeStore.activeBattlers[defender].battleStats.isAlive=false;
			PokeStore.playerPokemonArray[defender][PokeStore.activeBattlers[defender].battleStats.index]=PokeStore.activeBattlers[defender];
			battle.retObj.faint=battle.checkTeamStatus(defender);
		} else{
			console.log("battle continues!")
			battle.retObj.faint=99;
		}
	}
	
	
	// to change the color of the health bar of the defending pokemon
	battle.hpType= function(defender){
		battle.refHp=((PokeStore.activeBattlers[defender].battleStats.hpCurr)/(PokeStore.activeBattlers[defender].battleStats.hpMax));
		if(battle.refHp<=0.1){
			return "danger";
		}else if((battle.refHp>0.1)&&(battle.refHp<=0.5)){
			return "warning";
		}else{
			return "success";
		}
	}
	
	
	// for now these two attack functions are separated until
	// populate attack buttons with proper move names
	
	battle.spAttack=function(attacker,defender){
		battle.m=battle.miss(); 
		if(battle.m===0){
			battle.retObj.display="MISS!";
			battle.retObj.faint=99;
			battle.retObj.dmg=0;
			battle.retObj.hpBarType = PokeStore.activeBattlers[defender].battleStats.hpBarType; 
			console.log("miss!");
			PokeStore.activeBattlers[defender].battleStats.hpCurr = PokeStore.activeBattlers[defender].battleStats.hpCurr +0;
			return battle.retObj;
		} else{
			battle.spAtk=PokeStore.activeBattlers[attacker].battleStats.spAttack;
			battle.spDef=PokeStore.activeBattlers[defender].battleStats.spDefense;
			battle.atkLvl=PokeStore.activeBattlers[attacker].battleStats.level;
			battle.crit=battle.critical(attacker,defender); //determine critical mulitplier for this attack
			battle.damage = battle.crit*(((((2*(battle.atkLvl))+10)/200)*(((battle.spAtk)*(PokeStore.activeBattlers[attacker].stats[2].base_stat))/(1.25*(battle.spDef)))+2));
			PokeStore.activeBattlers[defender].battleStats.hpCurr = (PokeStore.activeBattlers[defender].battleStats.hpCurr-battle.damage);
			
			// set final returns
			battle.faintCheck(defender);
			battle.retObj.dmg=Math.round(battle.damage);
			battle.retObj.hpBarType=battle.hpType(defender); 
			return battle.retObj;
		}
	}
	
	
	battle.phAttack=function(attacker,defender){
		battle.m=battle.miss(); 
		if(battle.m===0){
			battle.retObj.display="MISS!";
			battle.retObj.faint=99;
			battle.retObj.dmg=0;
			battle.retObj.hpBarType = PokeStore.activeBattlers[defender].battleStats.hpBarType;
			console.log("miss!");
			PokeStore.activeBattlers[defender].battleStats.hpCurr = PokeStore.activeBattlers[defender].battleStats.hpCurr +0;
			return battle.retObj;
		} else{
			battle.phAtk=PokeStore.activeBattlers[attacker].battleStats.phAttack;
			battle.phDef=PokeStore.activeBattlers[defender].battleStats.phDefense;
			battle.atkLvl=PokeStore.activeBattlers[attacker].battleStats.level;
			battle.crit=battle.critical(attacker,defender); //determine critical mulitplier for this attack
			battle.damage = battle.crit* ((((2*(battle.atkLvl))+10)/200)*(((battle.phAtk)*(PokeStore.activeBattlers[attacker].stats[2].base_stat))/(1.25*(battle.phDef)))+2);
			PokeStore.activeBattlers[defender].battleStats.hpCurr = (PokeStore.activeBattlers[defender].battleStats.hpCurr-battle.damage);
			console.log("Damage: " + battle.damage);
			
			// set final returns
			battle.faintCheck(defender);
			battle.retObj.dmg=Math.round(battle.damage);
			battle.retObj.hpBarType=battle.hpType(defender);
			return battle.retObj;
			
		}
	}
	
	
	
	
	
}); 