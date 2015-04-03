var app = angular.module('discoverApp', ['ngResource','nln.ui','nln.ui.utils'
   ,'template/handlebars/hbs_advanced_filters.html'
   ,'template/handlebars/hbs_simple_filters.html']);
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

    $scope.filters = $window.DSpace.discovery.filters;
    backupOriginalFilters();
    if (typeof $window.DSpace.discovery !== 'undefined') { // start index at 1
      if ($scope.filters.length == 0) { addNewFilter(0); }
    }

    $scope.filterTypes = $window.DSpace.i18n.discovery.filtertype;
    $scope.filterTypesKeys = Object.keys($scope.filterTypes);
    $scope.relOperators = $window.DSpace.i18n.discovery.filter_relational_operator;
    $scope.relOperatorsKeys = Object.keys($scope.relOperators);

    function addNewFilter(idx, type, relop, query) {
      if (type) {
          $scope.filters.splice(idx, 0, {
                type: type,
                relational_operator: relop,
                query: query                    
          });          
      } else {
          $scope.filters.splice(idx, 0, {
                type: null,
                relational_operator: null,
                query: ''                    
          });
      }
    }

    function removeFilterAtIndex(idx) {
      $scope.filters.splice(idx, 1);
      if ($scope.filters.length == 0) { addNewFilter(0); }       
    }

    $scope.addFilter = function (idx, ev) {
      addNewFilter(idx+1);
    }

    $scope.removeFilter = removeFilterAtIndex;

    $scope.removeFilterAtLabel = function (idx) {
        removeFilterAtIndex(idx);
        // TODO submit form
    }

    $scope.onSubmit = function(ev) {
console.log('onSubmit'+ev); // TODO
    }


    $scope.notempty = function(val, idx) {
        return (val.query ? true : false);
    }

    function backupOriginalFilters() {
        $window.DSpace.discovery.orig_filters = $window.DSpace.discovery.filters.slice(0);
    }

    $scope.restoreOriginalFilters = function() {
        $window.DSpace.discovery.filters = $window.DSpace.discovery.orig_filters.slice(0);        
    }






    $scope.getAuthors = function (pattern, success, error) {
      return(Authors.query({pt: pattern}, success, error));
    };

    $scope.getSeries = function (pattern, success, error) {
      return(Series.query({pt: pattern}, success, error));
    };

}]);

angular.module('template/handlebars/hbs_simple_filters.html',[])
.run(['$templateCache', function ($templateCache) {
   $templateCache.put('template/handlebars/hbs_simple_filters.html',
       '    <label ng-repeat="fil in filters | filter:notempty"  ng-click="removeFilterAtLabel($index)" href="#" class="label label-primary">{{fil.query}}&nbsp;&times;</label>'
      +'');
}]);

angular.module('template/handlebars/hbs_advanced_filters.html', [])
.run(['$templateCache', function ($templateCache) {
   $templateCache.put('template/handlebars/hbs_advanced_filters.html',
       '<div ng-repeat="fil in filters" id="aspect_discovery_SimpleSearch_row_filter-new-{{$index+1}}"'
      +'     class="ds-form-item row advanced-filter-row search-filter">'
      +'    <div class="col-xs-4 col-sm-2">'
      +'        <p>'
      +'            <select id="aspect_discovery_SimpleSearch_field_filtertype_{{$index+1}}" class="ds-select-field form-control"'
      +'                    name="filtertype_{{$index+1}}">'
      +'                <option ng-repeat="ft in filterTypes" value="{{filterTypesKeys[$index]}}">{{filterTypes[filterTypesKeys[$index]]}}</option>'
      +'            </select>'
      +'        </p>'
      +'    </div>'
      +'    <div class="col-xs-4 col-sm-2">'
      +'        <p>'
      +'            <select id="aspect_discovery_SimpleSearch_field_filter_relational_operator_{{$index+1}}"'
      +'                    class="ds-select-field form-control" name="filter_relational_operator_{{$index+1}}">'
      +'                <option ng-repeat="op in relOperators" value="{{relOperatorsKeys[$index]}}">{{relOperators[relOperatorsKeys[$index]]}}</option>'
      +'            </select>'
      +'        </p>'
      +'    </div>'
      +'    <div class="col-xs-4 col-sm-6">'
      +'        <p>'
      +'            <input id="aspect_discovery_SimpleSearch_field_filter_{{$index+1}}"'
/*+'                   ng-model="author_filter_{{$index+1}}" nln-typahead nln-typa-resource="getAuthors" nln-typa-not-filter="true" nln-typa-selected="filter_{{$index+1}}"'*/
      +'                   class="ds-text-field form-control discovery-filter-input discovery-filter-input"'
      +'                   name="filter_{{$index+1}}" type="text" value="{{fil.query}}">'
      +'        </p>'
      +'    </div>'
      +'    <div class="hidden-xs col-sm-2">'
      +'        <div class="btn-group btn-group-justified">'
      +'                <p class="btn-group">'
      +'                    <button id="aspect_discovery_SimpleSearch_field_add-filter_{{$index+1}}" ng-click="addFilter($index, $event)"'
      +'                            class="ds-button-field btn btn-default filter-control filter-add filter-control filter-add"'
      +'                            name="add-filter_{{$index+1}}" type="button" title="Add Filter"><span'
      +'                            class="glyphicon glyphicon-plus-sign" aria-hidden="true"></span></button>'
      +'                </p>'
      +'                <p class="btn-group">'
      +'                    <button id="aspect_discovery_SimpleSearch_field_remove-filter_{{$index+1}}" ng-click="removeFilter($index)"'
      +'                            class="ds-button-field btn btn-default filter-control filter-remove filter-control filter-remove"'
      +'                            name="remove-filter_{{$index+1}}" type="button" title="Remove"><span'
      +'                            class="glyphicon glyphicon-minus-sign" aria-hidden="true"></span></button>'
      +'                </p>'
      +'        </div>'
      +'    </div>'
      +'</div>'
      +'');
}]);































































;






































































































































































