import ProductionForm from "../../components/prod-form";

export default function SotanghonPackingForm() {
  return (
    <ProductionForm
      title="Packing Form"
      skuTable="kf_sku"
      submitTable="kf_packing"
      skuFilterValue="packing"
      valueField="qty"
      valueLabel="Quantity"
    />
  );
}
