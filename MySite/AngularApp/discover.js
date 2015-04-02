var app = angular.module('discoverApp', ['ngResource','nln.ui','nln.ui.utils']);
//
// Run
app.run(['$rootScope', function($rootScope) { 
  $rootScope.endPoint = 'http://localhost:8070/rs/service';
  $rootScope.resources = {
     authors: '/authors/names'
    ,authorsJ: 'authors.json'
    ,series: '/communities/titles'
  };
}]);
//
// Factories   
app.factory('Authors', ['$rootScope', '$resource', function($rootScope, $resource) {
//      return resource = $resource($rootScope.resources.authorsJ);
  return $resource($rootScope.endPoint + $rootScope.resources.authors);
}]);    
app.factory('Series', ['$rootScope', '$resource', function($rootScope, $resource) {
  return $resource($rootScope.endPoint + $rootScope.resources.series);
}]);    
//
// Controller
app.controller('SearchBoxController', ['$scope', '$rootScope', '$window', 'focus', 'Authors', 'Series',
function($scope, $rootScope, $window, focus, Authors, Series) {
    $scope.$window = $window;  
    $scope.myVar = "lanyy";

    $scope.getAuthors = function (pattern, success, error) {
      return(Authors.query({pt: pattern}, success, error));
    };

    $scope.getSeries = function (pattern, success, error) {
      return(Series.query({pt: pattern}, success, error));
    };

}]);
