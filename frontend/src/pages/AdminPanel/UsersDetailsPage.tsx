import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getUserById,
  selectSelectedUser,
  selectSelectedUserLoading,
  clearSelectedUser,
} from "@/store/slices/usersSlice";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useFormattedDate } from "@/hooks/useFormattedDate";
import DeleteUserButton from "@/components/Admin/UserManagement/UserDeleteButton";

const UsersDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectSelectedUser);
  const loading = useAppSelector(selectSelectedUserLoading);
  const { formatDate } = useFormattedDate();

  useEffect(() => {
    if (id) {
      void dispatch(getUserById(id));
    }

    return () => {
      // clear selected user when leaving the page
      dispatch(clearSelectedUser());
    };
  }, [id, dispatch]);

  if (loading || !user) {
    return <Spinner containerClasses="py-10" />;
  }

  return (
    <div className="mt-4 mx-10">
      <div>
        <Button
          onClick={() => navigate(-1)}
          className="text-secondary px-6 border-secondary border-1 rounded-2xl bg-white hover:bg-secondary hover:text-white"
        >
          <ChevronLeft /> Back
        </Button>
      </div>

      <div className="mt-6 max-w-3xl">
        <h2 className="text-xl font-semibold mb-4">{user.full_name}</h2>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <strong>Email:</strong> {user.email ?? "-"}
          </div>
          <div>
            <strong>Phone:</strong> {user.phone ?? "-"}
          </div>
          <div>
            <strong>Created:</strong>{" "}
            {user.created_at
              ? formatDate(new Date(user.created_at), "d MMM yyyy")
              : "-"}
          </div>
          <div>
            <strong>ID:</strong> {user.id}
          </div>
        </div>
        <div className="mt-6">
          <DeleteUserButton id={user.id} closeModal={() => navigate(-1)} />
        </div>
      </div>
    </div>
  );
};

export default UsersDetailsPage;
