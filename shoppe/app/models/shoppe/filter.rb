module Shoppe
  class Filter < ActiveRecord::Base
    belongs_to :filter_element, polymorphic: true
    has_many  :design_projects_filters, :class_name => 'Shoppe::DesignProjectsFilter'
    has_many  :design_projects, through: :design_projects_filters, :class_name => 'Shoppe::DesignProject'
  end
end