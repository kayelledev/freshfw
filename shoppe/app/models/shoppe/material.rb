module Shoppe
  class Material < ActiveRecord::Base
  	validates :name, :presence => true
  	has_many  :products, :class_name => 'Shoppe::Product'
  end
end
