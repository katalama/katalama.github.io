function daysInMonth(month,year) {
	return new Date(year, month, 0).getDate();
}

function dayInYear(day, month, year) {
	return Math.floor(new Date(year, month, day) - new Date(now.getFullYear(), 0, 0)/(1000 * 60 * 60 * 24));
}

function format(day) {
	var date = day.getDate();
	var month = day.getMonth() + 1;
	
	return (date<=9?'0':'') + date + '.' + (month<=9?'0':'') + month + '.' + day.getFullYear();
}

function formatTimePart(part) {
	var timeHour = part>>2;
	var timeMinutes = (part - (timeHour<<2))*15;
	return (timeHour<=9?'0':'') + timeHour + ':' + (timeMinutes==0?'00':timeMinutes);
}

angular.module('scheduleApp', ['ngAnimate'])
	.controller('scheduleController', function($scope, $window) {
		var schedule = this;
		
		$scope.ACTION_WEDDING_SIZE = 0;
		$scope.ACTION_EVENING_SIZE = 1;
		$scope.ACTION_CHILDREN_SIZE = 2;
		$scope.ACTION_TAKEAWAY = 3;
		$scope.ACTION_VAPORIZE = 4;
		$scope.ACTION_CLEANING = 5;
		
		$scope.actions = [
			{duration: 4, title: 'Примерка свадебного платья'},
			{duration: 4, title: 'Примерка вечернего платья'},
			{duration: 4, title: 'Примерка детского платья'},
			{duration: 2, title: 'Забрать платье'},
			{duration: 2, title: 'Отдать на отпаривание'},
			{duration: 2, title: 'Отдать в хим. чистку'}
		];
		
		$scope.checkInTimes = [[], [], [], [], [], []];
		
		$scope.chooseAction = function($event, actionId){
			$scope.choosenAction = actionId;
			$scope.currentScreen = 'choose-time';
			
			for(var i=0; i<$scope.dayNumber.length; i++){
				var day_frmt = format($scope.dayNumber[i]);
				var tmp = new Array(24*4);
				if (day_frmt in $scope.busyTimes) {
					for (var j=0; j < $scope.busyTimes[ day_frmt ].length; j++){
						var part = $scope.busyTimes[ day_frmt ][j];
						tmp[part] = 1;
						for (var k=1; k<$scope.actions[$scope.choosenAction].duration; k++)
							tmp[part-k] = (tmp[part-k]|0) | 2; // not busy, but too near
					}
				}
				$scope.timesList[day_frmt] = tmp;
			}
			
			if ($scope.choosenDay)
				$scope.checkInDayClick($scope.choosenDay);
			
			$event.stopPropagation();
		};
		
		$scope.removeCheckInTime = function($event, checkInTimeId){
			$scope.checkInTimes[$scope.choosenAction].splice(checkInTimeId, 1);
			$event.stopPropagation();
		};
		
		$scope.isActiveAction = function(actionId){
			return ($scope.choosenAction == actionId) ? 'btn-warning active' : 'btn-default';
		};
		
		$scope.busyTimes = {
			'01.06.2016' : [53, 54, 55, 56, 66, 67, 80]
		};
		
		$scope.timesList = {};

		$scope.init = function(){
			$scope.currentScreen = 'choose-action';
			
			$scope.choosenDay = null;
			
			$scope.dayNumber = [];
			var now = new Date();
			var fd = now - ((new Date()).getDay() - 1)*60*60*24*1000;
			
			for (var i=0; i<7*5; i++) {
				var day = new Date(fd + i*24*60*60*1000);
				var day_frmt = format(day);
				
				$scope.dayNumber[i] = day;
			}
		};

		$scope.getDay = function(day, week){
			return $scope.dayNumber[(week-1)*7 + day-1].getDate();
		};
		
		$scope.getTimeClass = function(time){
			var day_frmt = format($scope.choosenDay);
			if ( day_frmt in $scope.timesList){
				if ( $scope.timesList[day_frmt][time] & 1 )
					return 'btn-danger disabled';

				if ( $scope.timesList[day_frmt][time] & 2 )
					return 'btn-warning disabled';
			}
			return 'btn-success';
		};
		
		$scope.renderTime = function(time){
			var timeHour = time>>2;
			var timeMinutes = (time - (timeHour<<2))*15;
			return timeMinutes==0 ? ('' + timeHour) : '-';
		};
		
		$scope.getDayStyle = function(day, week){
			var now = new Date();
			var day = $scope.dayNumber[(week-1)*7 + day-1];
			var style;
			
			if ( day.getMonth() > now.getMonth() ) {
				style = 'future next-month';
			} 
			else if ( day.getMonth() < now.getMonth() ) {
				style = 'past prev-month';
			}
			else {
				if ( now.getDate() < day.getDate() )
					style = 'future cur-month';
				else if ( now.getDate() > day.getDate() )
					style = 'past cur-month';
				else
					style = 'present cur-month';
			}
			
			if (day == $scope.choosenDay)
				style = style + ' ' + 'choosen';
			return style;
		};
		
		$scope.checkInDayClick = function( day, week){
			if (typeof day != 'undefined' && typeof week != 'undefined') {
				var day = $scope.dayNumber[(week-1)*7 + day-1];
			
				$scope.choosenDay = day;
			}
			else if ($scope.choosenDay)
				var day = $scope.choosenDay;
			else 
				return;
			
			$scope.times = [];
			for (var i=10*4; i<21*4; i++)
				$scope.times.push({
					part:i, 
					class: ''+$scope.getTimeClass(i)
				});
		}
		
		$scope.addCheckInTime = function(part){
			if ($scope.checkInTimes[$scope.choosenAction].length >= 5 || $scope.timesList[format($scope.choosenDay)][part]>0)
				return;
			
			var day = $scope.choosenDay;
			$scope.checkInTimes[$scope.choosenAction].push( {time: format(day) + ' ' + formatTimePart(part) } );
		};
		
		$scope.init();
	});
