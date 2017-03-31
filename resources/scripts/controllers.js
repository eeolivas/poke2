/**
 *
 */
//
//var PokeStore.poSto={};
//PokeStore.poSto.pokeArray=[]; 

//'$state', function($state),
// form http with service example
angular.module("PokemonModule").controller("GenCtrl",  function($state, $timeout, PokeStore, $q){
	var gen = this;

	PokeStore.clearPokeArray();
	gen.btnHider=false;
	gen.loadingImage=false;
	gen.p0=false;
	gen.p1=false;
	gen.prob1=false;
	gen.prob2=false
	gen.fatalError=false;
	gen.promise=[]
	
	//the setProb functions are for dusplaying to user 
	//any problems with retrieving pokemon
	// called by set timeout functions
	gen.setProb1=function(){gen.prob1=true;}
	gen.setProb2=function(){gen.prob2=true;}
	gen.setFatal=function(){gen.fatalError=true;}

	
	gen.randomPokemon = function() {
		gen.btnHider=true
		gen.loadingImage=true;
		gen.promise.splice(0);
		
		// set the limit for ii to be the number of pokemon wanted
		for(ii=0; ii<6; ii++){
			gen.rand = (Math.floor(Math.random() * 384))+1;
								// change this num ^ to determine range of selectd pokemon
			gen.promise.push(PokeStore.requestPokemon(gen.rand));		
		}
		
		// q.all with an array of promises that will do the ".then function" when all promises are fulfilled
		$q.all([gen.promise[0],gen.promise[1],gen.promise[2],gen.promise[3],gen.promise[4],gen.promise[5]]).then(function(values){
			PokeStore.pokeArray=values;
			console.log('fulfilled');
			PokeStore.refresh = false;
			$state.go('match');
		}, function(reason){
			gen.setFatal();
		});

	
		// time before displaying possible error messages
		$timeout(gen.setProb1, 6000);
		$timeout(gen.setProb2, 11000);
		
		
	}		
});

angular.module("PokemonModule").controller("matCtrl", function($state, $timeout, PokeStore) {
	var mat=this;
	
	if(PokeStore.refresh===true){
		$state.go('genMatchup');
	}
	
	console.log('passed the check');
	PokeStore.unboxPokemon();
	PokeStore.setStats(0);
	PokeStore.setStats(1);
	mat.player0Poke = PokeStore.playerPokemonArray[0];
	mat.player1Poke = PokeStore.playerPokemonArray[1];

	
	console.log("Player 0 pokes");
	for(ii=0; ii<mat.player0Poke.length;ii++){
		console.log(mat.player0Poke[ii]);
	}
	
	console.log("Player 1 pokes");
	for(ii=0; ii<mat.player1Poke.length;ii++){
		console.log(mat.player1Poke[ii]);
	}

//	// turn these all false for realzies  -true is just for testing
//	// also uncomment out code below -set timeouts
	mat.poke0Show=false;
	mat.poke1Show=false;
	mat.battlebox = false;

	mat.beginShow= false;
//	PokeStore.setBattleStats();

	mat.setTruBattleBox = function(){
		mat.battlebox=true;
	};	
	mat.setTruPoke0Show = function(){
		mat.poke0Show=true;
	};		
	mat.setTruPoke1Show = function(){
		mat.poke1Show=true;
	};		

	mat.setTrubeginShow=function(){
		mat.beginShow=true;
	}
	$timeout(mat.setTruBattleBox, 1000);
	$timeout(mat.setTruPoke0Show, 2500);
	$timeout(mat.setTruPoke1Show, 3500);
	$timeout(mat.setTrubeginShow, 4500);

	
	mat.enterFighters=function(){
		PokeStore.playerPokemonArray[0][0].battleStats.isActive=true;
		PokeStore.playerPokemonArray[1][0].battleStats.isActive=true;
		PokeStore.activeBattlers[0]=PokeStore.playerPokemonArray[0][0];
		PokeStore.activeBattlers[1]=PokeStore.playerPokemonArray[1][0];
		if((mat.player0Poke[0].stats[0].base_stat)>(mat.player1Poke[0].stats[0].base_stat)){
			$state.go('playerOneView');
		} else{
			$state.go('playerTwoView');
		}
	}
	mat.restart=function(){
		$state.go('genMatchup');
	}
});



angular.module("PokemonModule").controller("PlayerOne", function($state, $timeout, PokeStore, BattleLogic) {
	var pOne=this;
	
	if(PokeStore.refresh===true){
		$state.go('genMatchup');
	}
	
	pOne.hideMoves=false;
	pOne.poke0= PokeStore.activeBattlers[0];
	pOne.poke1=PokeStore.activeBattlers[1];
	console.log("currently fighting");
	console.log(pOne.poke0);
	console.log(pOne.poke1);
	
	pOne.changeState = function(faint){
		if(faint===99){
			$state.go('playerTwoView');
		}
		if (faint===0){
			$state.go('switch1State')
		}
		if(faint===1){
			$state.go('switch2State');
		}
		if(faint===-1){
			$state.go('playerTwoWin');
		}
		if(faint===-2){
			$state.go('playerOneWin');
		}
		
	}
	
	pOne.myself = function(){
		pOne.poke0.battleStats.hpCurr = pOne.poke0.battleStats.hpCurr-10; 
	}
	pOne.opponent = function(){
		pOne.poke1.battleStats.hpCurr = pOne.poke1.battleStats.hpCurr-10; 
	}
	
	// pOne.check is the object that is returned from battleLogic
	// .faint = the value that determines state change
	// .display = string tells move and cirt/miss etc
	// .dmg = amount of damage done
	//.hpBarType = to change the color of the defending pokemon's bar
	pOne.spAtk = function(){
		pOne.hideMoves=true;
		pOne.check=BattleLogic.spAttack(0,1);
		pOne.poke1.battleStats.hpBarType=pOne.check.hpBarType;
		console.log("return color poke1: " + pOne.poke1.battleStats.hpBarType);
		console.log("faint value: "+ pOne.check.faint);
		$timeout(pOne.changeState, 2500,true, pOne.check.faint);
	}
	pOne.phAtk = function(){
		pOne.hideMoves=true;
		pOne.check=BattleLogic.phAttack(0,1);
		pOne.poke1.battleStats.hpBarType=pOne.check.hpBarType;
		console.log("return color poke1: " + pOne.poke1.battleStats.hpBarType);
		console.log("faint value: "+ pOne.check.faint);
		$timeout(pOne.changeState, 2500,true, pOne.check.faint);
	}
	
	pOne.switchPokemon=function(){
		$state.go('switch1State');
	}
	
	pOne.restart=function(){
		$state.go('genMatchup');
	}

	
	
	// debugging method
	pOne.switchView=function(){
		$state.go('playerTwoView');
	}
});

angular.module("PokemonModule").controller("PlayerTwo", function($state, $timeout, PokeStore, BattleLogic) {
	var pTwo=this;
	
	if(PokeStore.refresh===true){
		$state.go('genMatchup');
	}
	
	pTwo.hideMoves=false;
	pTwo.poke0= poke0= PokeStore.activeBattlers[0];
	pTwo.poke1=poke0= PokeStore.activeBattlers[1];
	console.log("currently fighting");
	console.log(pTwo.poke0);
	console.log(pTwo.poke1);

	
	pTwo.changeState = function(faint){
		if(faint===99){
			$state.go('playerOneView');
		}
		if (faint===0){
			$state.go('switch1State')
		}
		if(faint===1){
			$state.go('switch2State');
		}
		if(faint===-1){
			$state.go('playerTwoWin');
		}
		if(faint===-2){
			$state.go('playerOneWin');
		}
		
	}
	
	pTwo.myself = function(){
		pTwo.poke1.battleStats.hpCurr = pTwo.poke1.battleStats.hpCurr-10; 
	}
	pTwo.opponent = function(){
		pTwo.poke0.battleStats.hpCurr = pTwo.poke0.battleStats.hpCurr-10; 
	}
	
	
	// pTwo.check is the object that is returned from battleLogic
	// .faint = the value that determines state change
	// .display = string tells move and cirt/miss etc
	// .dmg = amount of damage done
	pTwo.spAtk = function(){
		pTwo.hideMoves=true;
		pTwo.check=BattleLogic.spAttack(1,0);
		pTwo.poke0.battleStats.hpBarType=pTwo.check.hpBarType;
		console.log("return color poke0: " + pTwo.poke0.battleStats.hpBarType);
		console.log("faint value: "+ pTwo.check.faint);
		$timeout(pTwo.changeState, 2500,true, pTwo.check.faint);
	}
	
	pTwo.phAtk = function(){
		pTwo.hideMoves=true;
		pTwo.check=BattleLogic.phAttack(1,0);
		pTwo.poke0.battleStats.hpBarType=pTwo.check.hpBarType;
		console.log("return color poke0: " + pTwo.poke0.battleStats.hpBarType);
		console.log("faint value: "+ pTwo.check.faint);
		$timeout(pTwo.changeState, 2500,true, pTwo.check.faint);
	}
	
	pTwo.switchPokemon=function(){
		$state.go('switch2State');
	}
	
	
	pTwo.restart=function(){
		$state.go('genMatchup');
	}
	
	//debugging method
	pTwo.switchView=function(){
		$state.go('playerOneView');
	}

});


angular.module("PokemonModule").controller("P1Switch",  function($state, $timeout, PokeStore, $q){
	var p1Switch = this;
	
	if(PokeStore.refresh===true){
		$state.go('genMatchup');
	}
	p1Switch.pokeTeam = PokeStore.playerPokemonArray[0];
	console.log('Team:');
	console.log(p1Switch.pokeTeam);
	p1Switch.cancelChange=function(){
		$state.go('playerOneView');
	}
	
	p1Switch.changeFighter=function(team,poke){
		PokeStore.switchBattler(team,poke);
		$state.go('playerTwoView');
	}
});

angular.module("PokemonModule").controller("P2Switch",  function($state, $timeout, PokeStore, $q){
	var p2Switch = this;
	
	if(PokeStore.refresh===true){
		$state.go('genMatchup');
	}
	
	p2Switch.pokeTeam = PokeStore.playerPokemonArray[1];
	console.log('Team:');
	console.log(p2Switch.pokeTeam);
	p2Switch.cancelChange=function(){
		$state.go('playerTwoView');
	}
	
	p2Switch.changeFighter=function(team,poke){
		PokeStore.switchBattler(team,poke);
		$state.go('playerOneView');
	}
});


angular.module("PokemonModule").controller("PlayerOneWin",  function($state, PokeStore){
	var p1w=this;
	
	if(PokeStore.refresh===true){
		$state.go('genMatchup');
	}
	
	p1w.winner = PokeStore.playerPokemonArray[0];
	p1w.loser = PokeStore.playerPokemonArray[1];
	
	p1w.restart=function(){
		$state.go('genMatchup');
	}
});

angular.module("PokemonModule").controller("PlayerTwoWin",  function($state, PokeStore){
	var p2w=this;
	
	if(PokeStore.refresh===true){
		$state.go('genMatchup');
	}
	
	p2w.winner = PokeStore.playerPokemonArray[1];
	p2w.loser = PokeStore.playerPokemonArray[0];
	p2w.restart=function(){
		$state.go('genMatchup');
	}
});
