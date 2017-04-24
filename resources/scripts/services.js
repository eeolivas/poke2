/**
 *
 */

// storing pokemon data
angular.module("PokemonModule").service("PokeStore", function($http, $state) {
       	var poSto = this;
       	poSto.refresh = true;
       	poSto.baseLevel = 60;
       	poSto.fullMoves = null;
       	poSto.pokeArray=[]; // where the base pokemon RESPONSES are stored
       	poSto.playerPokemonArray = [[],[]]; // players' pokemon team
       	poSto.movePromiesUrls = [];
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
    			poSto.getMovesUrls(poSto.playerPokemonArray[teamIndex][ii]);
    		}
//    		poSto.getMoves(teamIndex);
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
    		pokemon.battleStats.hpBarType="success";
    		pokemon.battleStats.moves=[];
       		pokemon.battleStats.speed = (pokemon.stats[0].base_stat)+(4*pokemon.battleStats.level);
    		pokemon.battleStats.spDefense = (pokemon.stats[1].base_stat)+(4*pokemon.battleStats.level);
    		pokemon.battleStats.spAttack = (pokemon.stats[2].base_stat)+(4*pokemon.battleStats.level);
    		pokemon.battleStats.phDefense = (pokemon.stats[3].base_stat)+(4*pokemon.battleStats.level);
    		pokemon.battleStats.phAttack = (pokemon.stats[4].base_stat)+(4*pokemon.battleStats.level);
    		pokemon.battleStats.hpMax = (pokemon.stats[5].base_stat)+(4*pokemon.battleStats.level);
    		pokemon.battleStats.hpCurr = (pokemon.stats[5].base_stat)+(4*pokemon.battleStats.level);  		
    	}
    	
    	
    	
    	// NOT FUNCTIONAL FOR NOW
    	poSto.getMovesUrls = function(pokemon){
    		console.log('getting moves');
    		poSto.maxMoveNum = pokemon.moves.length;
    		for(zz=0; zz<4; zz++){
    			poSto.moveRandom = (Math.floor(Math.random() * poSto.maxMoveNum));
    			poSto.movePromiesUrls.push(pokemon.moves[poSto.moveRandom].move.url);
    			console.log(pokemon.name + ": " + pokemon.moves[poSto.moveRandom].move.url);
    		}
    	}
    	
    	poSto.getMovesApi = function(moveString){
    		return $http({
    			method:"GET",
    			url:moveString
			});
    	} 
    	
//    	
//    	
//    	
//    	poSto.unboxMovesResponses = function(){
//    		poSto.teamMove
//    	}
    	
    	

    	poSto.unboxMoves = function(teamIndexx){
    		console.log("team " + teamIndexx);
    		if(teamIndexx===0){
    			poSto.movesStarter = 0;
    		} else {
    			poSto.movesStarter = 12;
    		}
    		
    		for(poSto.qq=0;poSto.qq<3;poSto.qq++){
    			for(poSto.ww=0;poSto.ww<4;poSto.ww++){
    				poSto.playerPokemonArray[teamIndexx][poSto.qq].battleStats.moves.push(poSto.fullMoves[poSto.movesStarter].data);
    				poSto.movesStarter++;
    			}

    		}
    		
    		// use
    	}
    	
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
    		poSto.moveArray=[[],[]];
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
			battle.retObj.display=battle.retObj.display + " Critical Hit!";
			return 2; 
		} else{
			battle.retObj.display=battle.retObj.display + " Hit!";
			return 1; 
		}
	}
	
	battle.miss=function(){
		battle.missCompare=(Math.floor(Math.random() * 15))+1;
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
	
	
	
	battle.attack=function(move,attacker,defender){
		battle.retObj.display = PokeStore.activeBattlers[attacker].name + " used " + PokeStore.activeBattlers[attacker].battleStats.moves[move].name + "!";
		battle.m=battle.miss(); 
		if(battle.m===0){
			battle.retObj.display=battle.retObj.display+ " MISSED!";
			battle.retObj.faint=99;
			battle.retObj.dmg=0;
			battle.retObj.hpBarType = PokeStore.activeBattlers[defender].battleStats.hpBarType; 
			console.log("miss!");
			PokeStore.activeBattlers[defender].battleStats.hpCurr = PokeStore.activeBattlers[defender].battleStats.hpCurr +0;
			return battle.retObj;
		} else{
			if(PokeStore.activeBattlers[attacker].battleStats.moves[move].damage_class.name === "physical"){
				console.log("this is a physical attack");
				battle.moveAttack= PokeStore.activeBattlers[attacker].battleStats.phAttack;
				battle.moveDefense = PokeStore.activeBattlers[defender].battleStats.phDefense;
				battle.movePower = PokeStore.activeBattlers[attacker].battleStats.moves[move].power;
			}
			
			else if(PokeStore.activeBattlers[attacker].battleStats.moves[move].damage_class.name === "special"){
				console.log("this is a special attack");
				battle.moveAttack= PokeStore.activeBattlers[attacker].battleStats.spAttack;
				battle.moveDefense = PokeStore.activeBattlers[defender].battleStats.spDefense;
				battle.movePower = PokeStore.activeBattlers[attacker].battleStats.moves[move].power;
			}
			else {
				console.log("this is a status attack");
				battle.moveAttack= PokeStore.activeBattlers[attacker].battleStats.spAttack;
				battle.moveDefense = PokeStore.activeBattlers[defender].battleStats.spDefense;
				battle.movePower = 25;
			}
			console.log(battle.movePower);
			battle.atkLvl=PokeStore.activeBattlers[attacker].battleStats.level;
			battle.crit=battle.critical(attacker,defender); //determine critical mulitplier for this attack
			battle.damage = battle.crit*(((((2/5)*(battle.atkLvl)+2)/50)*(battle.movePower)*(battle.moveAttack/battle.moveDefense))+2);
			PokeStore.activeBattlers[defender].battleStats.hpCurr = (PokeStore.activeBattlers[defender].battleStats.hpCurr-battle.damage);
			
			// set final returns
			battle.faintCheck(defender);
			battle.retObj.dmg=Math.round(battle.damage);
			battle.retObj.hpBarType=battle.hpType(defender); 
			return battle.retObj;
		}
	}
	
	
}); 