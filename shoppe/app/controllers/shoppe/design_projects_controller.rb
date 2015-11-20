require_dependency "shoppe/application_controller"

module Shoppe
  class DesignProjectsController < ApplicationController
  	load_and_authorize_resource
  end
end
