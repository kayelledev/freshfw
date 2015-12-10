class AddPositionsToDesignProjectsProducts < ActiveRecord::Migration
  def change
    add_column :shoppe_design_projects_products, :layout_posX, :integer, default: 0
    add_column :shoppe_design_projects_products, :layout_posY, :integer, default: 0
    add_column :shoppe_design_projects_products, :layout_rotation, :integer, default: 0
    add_column :shoppe_design_projects_products, :board_posX, :integer, default: 0
    add_column :shoppe_design_projects_products, :board_posY, :integer, default: 0
    add_column :shoppe_design_projects_products, :board_rotation, :integer, default: 0
  end
end
