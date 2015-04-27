class Item  < ActiveRecord::Base
  belongs_to :product, :class_name => 'Shoppe::Product'
  validates :item_name, :presence => true
  validates :item_sku, :presence => true
  validates :item_type, :presence => true
  validates :item_description, :presence => true

end
