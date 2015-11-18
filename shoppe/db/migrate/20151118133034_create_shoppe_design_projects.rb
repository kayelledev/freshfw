class CreateShoppeDesignProjects < ActiveRecord::Migration
  def change
    create_table :shoppe_design_projects do |t|

      t.timestamps null: false
    end
  end
end
