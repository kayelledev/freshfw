module Shoppe
  class Material < ActiveRecord::Base
  	validates :name, :presence => true
  	# has_many  :products, :class_name => 'Shoppe::Product'
  	has_and_belongs_to_many :products, :join_table => :shoppe_products_materials
  	has_many :filters, as: :filter_element, :class_name => 'Shoppe::Filter'
  end
end
