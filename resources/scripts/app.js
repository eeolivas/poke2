/**
 * app.js 
 * 
 *  
 *
 */

var app = angular.module("PokemonModule", ['ui.router', 'ui.bootstrap','ngAnimate']);

app.config(function($stateProvider, $urlRouterProvider) {
	
	var genMatchupState={
			name: 'genMatchup',
			url:'/generate',
			templateUrl:'resources/templates/generate.html',
//			controller: 'GenCtrl'
	}
	
	var testState={
			name: 'match',
			url:'/matchup',
			templateUrl:'resources/templates/match.html',
//			controller: 'testCtrl'
	}
	
//	// this state is no longer needed
//	var matchupState={
//			name: 'matchup',
//			url:'/matchup',
//			templateUrl:'resources/templates/mathcup.html',
//			controller: 'MatchCtrl'
//	}
	
	var pOneState = {
		name: 'playerOneView',
		url: '/playerOne',
		templateUrl: 'resources/templates/playerOneView.html',
//		controller: 'PlayerOne'
	};
	
	var pTwoState = {
		name: 'playerTwoView',
		url: '/playerTwo',
		templateUrl: 'resources/templates/playerTwoView.html',
//		controller: 'PlayerTwo'
	};
	
	var switch1State = {
			name: 'switch1State',
			url: '/player1switch',
			templateUrl: 'resources/templates/playerOneSwitch.html',
//			controller: 'PlayerTwo'
		};
	var switch2State = {
			name: 'switch2State',
			url: '/player2switch',
			templateUrl: 'resources/templates/playerTwoSwitch.html',
//			controller: 'PlayerTwo'
	};
	
	var pTwoWin = {
			name: 'playerTwoWin',
			url: '/playerTwoWin',
			templateUrl: 'resources/templates/playerTwoWin.html',
//			controller: 'PlayerTwoWin'
	};
	
	var pOneWin = {
			name: 'playerOneWin',
			url: '/playerOneWin',
			templateUrl: 'resources/templates/playerOneWin.html',
//			controller: 'PlayerOneWIn'
	};
	
	$stateProvider.state(genMatchupState);
	$stateProvider.state(testState);
//	$stateProvider.state(matchupState);
	$stateProvider.state(pOneState);
	$stateProvider.state(pTwoState);
	$stateProvider.state(switch1State);
	$stateProvider.state(switch2State);
	$stateProvider.state(pOneWin);
	$stateProvider.state(pTwoWin);
	
	//default routing
	$urlRouterProvider.otherwise('/generate');
	
});

