class AddColumnIsRoomForCategory < ActiveRecord::Migration
  def change
  	add_column :shoppe_product_categories, :is_room, :boolean, default: false
  end
end
