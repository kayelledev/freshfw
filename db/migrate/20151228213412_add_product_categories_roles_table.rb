class AddProductCategoriesRolesTable < ActiveRecord::Migration
  def change
  	create_table :shoppe_roles_product_categories do |t|
      t.references :role, index: true
      t.references :product_category, index: true
      t.timestamps null: false
    end
    add_index :shoppe_roles_product_categories, [:role_id, :product_category_id], :unique => true, :name => 'shoppe_roles_product_categories_index'
  end
end
