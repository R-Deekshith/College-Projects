item_names = ["apple", "bread", "milk", "eggs"]
item_prices = [1.0, 2.50, 3.00, 4.50]
item_stock = [100, 20, 50, 4]
def view():
    print("Item_Name","Item_Price","Item_Stock")
    for i in range(len(item_stock)):
        c=""
        if item_stock[i]<5:
            c="LOW STOCK"
        print(item_names[i],item_prices[i],item_stock[i],c)
def buy():
    a=input("Enter Item you want to Purchase:")
    if a.lower() in item_names:
        c=int(input("Enter no of Stock:"))
        if c>item_stock[item_names.index(a)]:
            print("Many Stock Not Available")
        else:
            print("Total Cost is ",item_prices[item_names.index(a)]*c)
            item_stock[item_names.index(a)]-=c
            print("Succesfully Purchased")
    else:
        print("Item Not Exist")
def add():
    a=input("Enter item you want to add:")
    if a.lower() in item_names:
        c=int(input("Enter Stock to Add:"))
        item_stock[item_names.index(a)]+=c
    else:
        item_names.append(a.lower())
        c=int(input("Enter Stock to Add:"))
        item_stock.append(c)
        c=float(input("Enter price:"))
        item_prices.append(c)
while True:
    print("1-View Inventory")
    print("2-Purchase Item")
    print("3-Restock Item")
    print("4-Exit")
    choice=input("Enter Choice:")
    if choice == '1':
        view()
    elif choice == '2':
        buy()
    elif choice == '3':
        add()
    elif choice == '4':
        print("BYE")
        break
    else:
        print("Enter Correct Option")
    print()
        