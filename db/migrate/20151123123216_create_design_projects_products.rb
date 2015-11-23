class CreateDesignProjectsProducts < ActiveRecord::Migration
  def change
    create_table :design_projects_products do |t|
      t.references :design_project, index: true
      t.references :product, index: true
      t.timestamps null: false
    end
    add_index :design_projects_products, [:design_project_id, :product_id], :unique => true, :name => 'design_projects_products_index'
  end
end
