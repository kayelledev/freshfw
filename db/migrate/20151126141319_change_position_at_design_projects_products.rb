class ChangePositionAtDesignProjectsProducts < ActiveRecord::Migration
  def up
    change_column :shoppe_design_projects_products, :layout_posX, :decimal, default: 0.0
    change_column :shoppe_design_projects_products, :layout_posY, :decimal, default: 0.0
    change_column :shoppe_design_projects_products, :layout_rotation, :decimal, default: 0.0
    change_column :shoppe_design_projects_products, :board_posX, :decimal, default: 0.0
    change_column :shoppe_design_projects_products, :board_posY, :decimal, default: 0.0
    change_column :shoppe_design_projects_products, :board_rotation, :decimal, default: 0.0
  end
  def down
    change_column :shoppe_design_projects_products, :layout_posX, :integer, default: 0
    change_column :shoppe_design_projects_products, :layout_posY, :integer, default: 0
    change_column :shoppe_design_projects_products, :layout_rotation, :integer, default: 0
    change_column :shoppe_design_projects_products, :board_posX, :integer, default: 0
    change_column :shoppe_design_projects_products, :board_posY, :integer, default: 0
    change_column :shoppe_design_projects_products, :board_rotation, :integer, default: 0
  end
end
