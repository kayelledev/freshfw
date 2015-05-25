class AddSubcategoryIdNameToShoppeProdCategories < ActiveRecord::Migration
  def change
    add_column :shoppe_product_categories, :subcategory_id, :integer
    add_column :shoppe_product_categories, :subcategory_name, :string
  end
end
