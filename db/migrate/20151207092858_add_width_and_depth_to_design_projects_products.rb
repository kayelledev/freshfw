class AddWidthAndDepthToDesignProjectsProducts < ActiveRecord::Migration
  def change
    add_column :shoppe_design_projects_products, :board_width, :decimal
    add_column :shoppe_design_projects_products, :board_depth, :decimal
  end
end
