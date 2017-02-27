/**
 *
 */

// storing pokemon data
angular.module("PokemonModule").service("PokeStore", function($http, $state) {
       	var poSto = this;
       	poSto.lvls=[50,50];
       	poSto.pokeArray=[]; // where the base pokemon objects are stored
       	
//       	poSto.p1Pokes=[]; can be used to introduce more pokes per player
//       	poSto.p2Pokes=[];
       	
       	poSto.makeSure=function(){
    		for(ii=0;ii<poSto.pokeArray.length;ii++){
    			if(!(poSto.pokeArray[ii])){
    				$state.go('genMatchup');
    			}	
			}
    	}
    	
    	//generate randomLevels fro the pokemon
    	poSto.setLvls = function(){
    		//setting levels to the base pokemon array for now
    		for(ii=0; ii<poSto.pokeArray.length; ii++){
    			poSto.pokeArray[ii].battleStats={};
    			poSto.pokeArray[ii].battleStats.level=(Math.floor(Math.random() * 100))+1;
    		}
    		// checck to make sure these values exist - go to start if not
    		if(!(poSto.pokeArray[0])||!(poSto.pokeArray[1])){
    			$state.go('genMatchup');
    		}
    		if(poSto.pokeArray[0].battleStats.level<((poSto.pokeArray[1].battleStats.level)-10)||poSto.pokeArray[0].battleStats.level>((poSto.pokeArray[1].battleStats.level)+10)){
    			poSto.setLvls();
    		}
    	};
    	
    	poSto.setSprites=function(){
    		// setting sprites to base pokemon array for now
    		for(ii=0;ii<poSto.pokeArray.length;ii++){
    			poSto.pokeArray[ii].imageFront="resources/sprites/front/"+poSto.pokeArray[ii].id+".png";
        		poSto.pokeArray[ii].imageBack="resources/sprites/back/"+poSto.pokeArray[ii].id+".png";
    		}
    	}
    	
    	
    	poSto.setBattleStats=function(){
    		// setting sprites, levels, and battlestats to the base pokemon array for now
    		poSto.makeSure(); // this may do nothing - the actual check is happening in setLvls()
    		poSto.setSprites();
    		poSto.setLvls();
    		for(ii=0;ii<poSto.pokeArray.length;ii++){
    			poSto.pokeArray[ii].battleStats.hpBarType="success"
       			poSto.pokeArray[ii].battleStats.speed = (poSto.pokeArray[ii].stats[0].base_stat)+(4*poSto.pokeArray[ii].battleStats.level);
    			poSto.pokeArray[ii].battleStats.spDefense = (poSto.pokeArray[ii].stats[1].base_stat)+(4*poSto.pokeArray[ii].battleStats.level);
    			poSto.pokeArray[ii].battleStats.spAttack = (poSto.pokeArray[ii].stats[2].base_stat)+(4*poSto.pokeArray[ii].battleStats.level);
    			poSto.pokeArray[ii].battleStats.phDefense = (poSto.pokeArray[ii].stats[3].base_stat)+(4*poSto.pokeArray[ii].battleStats.level);
    			poSto.pokeArray[ii].battleStats.phAttack = (poSto.pokeArray[ii].stats[4].base_stat)+(4*poSto.pokeArray[ii].battleStats.level);
    			poSto.pokeArray[ii].battleStats.hpMax = (poSto.pokeArray[ii].stats[5].base_stat)+(4*poSto.pokeArray[ii].battleStats.level);
    			poSto.pokeArray[ii].battleStats.hpCurr = poSto.pokeArray[ii].battleStats.hpMax;    		}
    	}
    	
    	// clears the base pokeon Array
    	poSto.clearPokeArray= function(){
    		poSto.pokeArray.splice(0);
    	};
    	
    	// returns promise to get pokemon - used with generate controller
    	poSto.requestPokemon = function(input) {
    		return $http({
    			method:"GET",
    			url:"https://pokeapi.co/api/v2/pokemon/" + input + "/"
			});
    	}
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
		if((PokeStore.pokeArray[attacker].battleStats.speed/PokeStore.pokeArray[defender].battleStats.speed)>battle.critCompare){
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
	
	// it seems this may only work for a 1v1 battle
	battle.faintCheck=function(defender){
		if(PokeStore.pokeArray[defender].battleStats.hpCurr <= 0){
			console.log(PokeStore.pokeArray[defender].name + " fainted!")
			battle.retObj.faint=defender;
//			return defender;
		} else{
			console.log("battle continues!")
			battle.retObj.faint=-1;
//			return -1;
		}
	}
	
	
	// to change the color of the health bar of the defending pokemon
	battle.hpType= function(defender){
		battle.refHp=((PokeStore.pokeArray[defender].battleStats.hpCurr)/(PokeStore.pokeArray[defender].battleStats.hpMax));
		console.log("current hp: " + battle.curr)
		console.log("max hp: " + battle.max)
		console.log("refHp: " + (battle.refHp));
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
			battle.retObj.faint=-1;
			battle.retObj.dmg=0;
			battle.retObj.hpBarType = PokeStore.pokeArray[defender].battleStats.hpBarType; 
			console.log("miss!");
			PokeStore.pokeArray[defender].battleStats.hpCurr = PokeStore.pokeArray[defender].battleStats.hpCurr +0;
			return battle.retObj;
		} else{
			battle.spAtk=PokeStore.pokeArray[attacker].battleStats.spAttack;
			battle.spDef=PokeStore.pokeArray[defender].battleStats.spDefense;
			battle.atkLvl=PokeStore.pokeArray[attacker].battleStats.level;
			battle.crit=battle.critical(attacker,defender); //determine critical mulitplier for this attack
			battle.damage = battle.crit*(((((2*(battle.atkLvl))+10)/200)*(((battle.spAtk)*(PokeStore.pokeArray[attacker].stats[2].base_stat))/(1.25*(battle.spDef)))+2));
			PokeStore.pokeArray[defender].battleStats.hpCurr = (PokeStore.pokeArray[defender].battleStats.hpCurr-battle.damage);
			
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
			battle.retObj.faint=-1;
			battle.retObj.dmg=0;
			battle.retObj.hpBarType = PokeStore.pokeArray[defender].battleStats.hpBarType;
			console.log("miss!");
			PokeStore.pokeArray[defender].battleStats.hpCurr = PokeStore.pokeArray[defender].battleStats.hpCurr +0;
			return battle.retObj;
		} else{
			battle.phAtk=PokeStore.pokeArray[attacker].battleStats.phAttack;
			battle.phDef=PokeStore.pokeArray[defender].battleStats.phDefense;
			battle.atkLvl=PokeStore.pokeArray[attacker].battleStats.level;
			battle.crit=battle.critical(attacker,defender); //determine critical mulitplier for this attack
			battle.damage = battle.crit* ((((2*(battle.atkLvl))+10)/200)*(((battle.phAtk)*(PokeStore.pokeArray[attacker].stats[2].base_stat))/(1.25*(battle.phDef)))+2);
			PokeStore.pokeArray[defender].battleStats.hpCurr = (PokeStore.pokeArray[defender].battleStats.hpCurr-battle.damage);
			console.log("Damage: " + battle.damage);
			
			// set final returns
			battle.faintCheck(defender);
			battle.retObj.dmg=Math.round(battle.damage);
			battle.retObj.hpBarType=battle.hpType(defender);
			return battle.retObj;
			
		}
	}
	
	
	
}); 