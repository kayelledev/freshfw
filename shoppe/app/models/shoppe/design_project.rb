module Shoppe
  class DesignProject < ActiveRecord::Base
  	belongs_to :user, :class_name => 'Shoppe::User'
  	belongs_to :product_category, :class_name => 'Shoppe::ProductCategory'
  	validates :name, presence: true
  	has_many  :design_projects_products, :class_name => 'Shoppe::DesignProjectsProduct'
  	has_many  :products, through: :design_projects_products, :class_name => 'Shoppe::Product'
  	has_many  :design_projects_filters, :class_name => 'Shoppe::DesignProjectsFilter'
  	has_many  :filters, through: :design_projects_filters, :class_name => 'Shoppe::Filter'
  	# has_many  :products, through: :filters, source: :filter_element, source_type: 'Shoppe::Product' 
  	# has_many  :colors, through: :filters, source: :filter_element, source_type: 'Shoppe::Color' 
  	# has_many  :materials, through: :filters, source: :filter_element, source_type: 'Shoppe::Material' 
  end
end
