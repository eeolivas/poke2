/**
 *
 */
//
//var PokeStore.poSto={};
//PokeStore.poSto.pokeArray=[]; 



angular.module("PokemonModule").controller("matCtrl", function($state, $timeout, PokeStore) {
	var mat=this;
	// guard against refreshing issue

	// turn these all false for realzies  -true is just for testing
	// also uncomment out code below -set timeouts
	mat.poke0Show=false;
	mat.poke1Show=false;
	mat.battlebox = false;
//	mat.bbheader = false; // maybe take this out
	mat.beginShow= false;
	PokeStore.setBattleStats();
	mat.poke0 =PokeStore.pokeArray[0];
	mat.poke1 =PokeStore.pokeArray[1];
	if((!mat.poke0)||(!mat.poke1)){
	$state.go('genMatchup');
	}
	console.log("poke0"); 
	console.log(mat.poke0); 
	console.log("poke1"); 
	console.log(mat.poke1); 
	
	mat.setTruBattleBox = function(){
		mat.battlebox=true;
	};	
	mat.setTruPoke0Show = function(){
		mat.poke0Show=true;
	};		
	mat.setTruPoke1Show = function(){
		mat.poke1Show=true;
	};		
	mat.setTrubBHeader = function(){
		mat.bbheader=true;
	};	
	mat.setTrubeginShow=function(){
		mat.beginShow=true;
	}
	$timeout(mat.setTruBattleBox, 1000);
//	$timeout(mat.setTrubBHeader, 1500);
	$timeout(mat.setTruPoke0Show, 2500);
	$timeout(mat.setTruPoke1Show, 3500);
	$timeout(mat.setTrubeginShow, 4500);

	
	mat.enterFighters=function(){
		if((mat.poke0.stats[0].base_stat)>(mat.poke1.stats[0].base_stat)){
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
	pOne.hideMoves=false;
	pOne.poke0= PokeStore.pokeArray[0];
	pOne.poke1=PokeStore.pokeArray[1];
	
//	pOne.poke0.hpBarType="null";
//	pOne.poke1.hpBarType="null";
	
	// guard against refreshing issue
	if((!pOne.poke0)||(!pOne.poke1)){
		$state.go('genMatchup');
	}
	pOne.changeState = function(faint){
		if(faint===-1){
			$state.go('playerTwoView');
		}
		if (faint===0){
			$state.go('playerTwoWin')
		}
		if(faint===1){
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
	pTwo.hideMoves=false;
	pTwo.poke0= PokeStore.pokeArray[0];
	pTwo.poke1=PokeStore.pokeArray[1];
	// guard against refreshing issue
	if((!pTwo.poke0)||(!pTwo.poke1)){
		$state.go('genMatchup');
	}
	
	pTwo.changeState = function(faint){
		if(faint===-1){
			$state.go('playerOneView');
		}
		if (faint===0){
			$state.go('playerTwoWin')
		}
		if(faint===1){
			$state.go('playerOneWin');
		}
	};
	
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
	
	
	
	pTwo.restart=function(){
		$state.go('genMatchup');
	}
	
	//debugging method
	pTwo.switchView=function(){
		$state.go('playerOneView');
	}

});



//'$state', function($state),
// form http with service example
angular.module("PokemonModule").controller("GenCtrl",  function($state, $timeout, PokeStore){
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
	
	gen.setProb1=function(){
		gen.prob1=true;
	}
	
	gen.setProb2=function(){
		gen.prob2=true;
	}
	
	gen.setFatal=function(){
		gen.fatalError=true;
	}
	
	gen.randomPokemon = function(input) {
		gen.btnHider=true
		gen.loadingImage=true;
		gen.promise.splice(0);
		for(ii=0; ii<2; ii++){
			gen.rand = (Math.floor(Math.random() * 150))+1;
			gen.promise.push(PokeStore.requestPokemon(gen.rand));		
		}
		// grabs and store the first pokemon
		gen.promise[0].then(function(response){
			PokeStore.pokeArray.unshift(response.data);
			console.log("first poke stored");
			gen.p0=true
			if((gen.p0)&&(gen.p1)){
				console.log("going to next state");
				$state.go('match');
			}
		}, function(response){
			console.log("failure to grab");
			gen.setFatal();
			gen.prob1=false;
			gen.prob2=false;
		});
		// grabs and stores the second pokemon and moves to next state
		gen.promise[1].then(function(response){
			PokeStore.pokeArray.unshift(response.data);
			console.log("second poke stored");
			gen.p1=true
			if((gen.p0)&&(gen.p1)){
				console.log("going to next state");
				$state.go('match');
			}
		}, function(response){
			console.log("failure to grab");
			gen.setFatal();
			gen.prob1=false;
			gen.prob2=false;
		});
	
		$timeout(gen.setProb1, 5000);
		$timeout(gen.setProb2, 10000);
		
		
	}		
});

angular.module("PokemonModule").controller("PlayerOneWin",  function($state, PokeStore){
	p1w=this;
	p1w.winner = PokeStore.pokeArray[0];
	p1w.loser = PokeStore.pokeArray[1];
	
	p1w.restart=function(){
		$state.go('genMatchup');
		
	}
});

angular.module("PokemonModule").controller("PlayerTwoWin",  function($state, PokeStore){
	p2w=this;
	p2w.winner = PokeStore.pokeArray[1];
	p2w.loser = PokeStore.pokeArray[0];
	p2w.restart=function(){
		$state.go('genMatchup');
	}
});
