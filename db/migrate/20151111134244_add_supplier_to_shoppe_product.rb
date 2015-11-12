class AddSupplierToShoppeProduct < ActiveRecord::Migration
  def change
    add_column :shoppe_products, :supplier_id, :integer, default: nil
    Shoppe::ProductAttribute.where(key:"Supplier").each do |attribute|
      supplier_id = Shoppe::Supplier.where(name: attribute.value).first_or_create.id
      attribute.product.update(supplier_id: supplier_id)
      attribute.destroy
    end
  end
end
