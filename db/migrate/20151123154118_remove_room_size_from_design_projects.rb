class RemoveRoomSizeFromDesignProjects < ActiveRecord::Migration
  def up
    remove_column :shoppe_design_projects, :room_size
  end

  def down
    add_column :shoppe_design_projects, :room_size, :string
  end
end
