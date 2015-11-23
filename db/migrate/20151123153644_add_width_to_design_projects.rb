class AddWidthToDesignProjects < ActiveRecord::Migration
  def change
    add_column :shoppe_design_projects, :width, :float, default: 0.0
    add_column :shoppe_design_projects, :depth, :float, default: 0.0
  end
end
