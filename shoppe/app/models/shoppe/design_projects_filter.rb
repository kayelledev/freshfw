module Shoppe
  class DesignProjectsFilter < ActiveRecord::Base
  	belongs_to :design_project, :class_name => 'Shoppe::DesignProject'
    belongs_to :filter, :class_name => 'Shoppe::Filter'
  end
end 
