module Shoppe
  class DesignProjectsProduct < ActiveRecord::Base
  	belongs_to :design_project, :class_name => 'Shoppe::DesignProject'
    belongs_to :product, :class_name => 'Shoppe::Product'
  end
end
