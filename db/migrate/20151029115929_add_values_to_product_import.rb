class AddValuesToProductImport < ActiveRecord::Migration
  def change
  	add_column :shoppe_products, :seat_width, :float, default: 0
  	add_column :shoppe_products, :seat_depth, :float, default: 0
  	add_column :shoppe_products, :seat_height, :float, default: 0
  	add_column :shoppe_products, :arm_height, :float, default: 0
  end
end
