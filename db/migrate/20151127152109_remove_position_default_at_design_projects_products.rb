class RemovePositionDefaultAtDesignProjectsProducts < ActiveRecord::Migration
  def up
    change_column_default :shoppe_design_projects_products, :layout_posX, nil
    change_column_default :shoppe_design_projects_products, :layout_posY, nil
    change_column_default :shoppe_design_projects_products, :layout_rotation, nil
    change_column_default :shoppe_design_projects_products, :board_posX, nil
    change_column_default :shoppe_design_projects_products, :board_posY, nil
    change_column_default :shoppe_design_projects_products, :board_rotation, nil
  end
  def down
    change_column_default :shoppe_design_projects_products, :layout_posX, 0.0
    change_column_default :shoppe_design_projects_products, :layout_posY, 0.0
    change_column_default :shoppe_design_projects_products, :layout_rotation, 0.0
    change_column_default :shoppe_design_projects_products, :board_posX, 0.0
    change_column_default :shoppe_design_projects_products, :board_posY, 0.0
    change_column_default :shoppe_design_projects_products, :board_rotation, 0.0
  end
end
