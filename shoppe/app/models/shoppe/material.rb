module Shoppe
  class Material < ActiveRecord::Base
  	validates :name, :presence => true
  	has_many  :products, :class_name => 'Shoppe::Product'
  	has_many :filters, as: :filter_element, :class_name => 'Shoppe::Filter'
  end
end
