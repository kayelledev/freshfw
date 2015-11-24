class DropRoomTypes < ActiveRecord::Migration
  def change
  	drop_table :shoppe_room_types
  	remove_column :shoppe_design_projects, :room_type_id
  end
end
