module Shoppe
  class Filter < ActiveRecord::Base
    belongs_to :filter_element, polymorphic: true
    has_many  :design_projects_filters, :class_name => 'Shoppe::DesignProjectsFilter'
    has_and_belongs_to_many  :design_projects, :class_name => 'Shoppe::DesignProject'
  end

end